import { Injectable, NgZone, computed, inject, signal } from "@angular/core";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { Observable, Subject, exhaustMap, filter, from, map, merge, of, retry, switchMap } from "rxjs";
import { SupabaseService } from "src/app/shared/_data-access/supabase.service";
import { TbHouseholdMembers, UpdateTbHouseholdMembers } from "../types/database";
import { AuthService } from "./auth.service";

interface HouseholdMemberssState {
    householdMembers: TbHouseholdMembers[]
}

@Injectable({
  providedIn: 'root'
})
export class HouseholdMembersService {
    private readonly ngZone = inject(NgZone);
    private supabaseService = inject(SupabaseService);
    private authService = inject(AuthService);
    private supabase = this.supabaseService.client;

    // sources
    #householdMembers$ = this.getHouseholdMemberss().pipe(
        retry({
            delay: () => toObservable(this.authService.currentUser).pipe(filter((user) => !!user))
        })
    )
    add$ = new Subject<any>();
    select$ = new Subject<any|null>();
    delete$ = new Subject<{householdId: number, userId: string}>();
    error$ = new Subject<string>();

    // state
    private state = signal<HouseholdMemberssState>({
        householdMembers: [],
    })

    // selectors
    householdMembers = computed(() => this.state().householdMembers);

    constructor() {
        this.#householdMembers$.pipe(takeUntilDestroyed()).subscribe((householdMembers) =>{
            const changes: Partial<HouseholdMemberssState> = {
                householdMembers
            }
         
            this.state.update((state) => {
                return { ...state, ...changes}
            })
        });

        this.add$.pipe(exhaustMap((householdMember) => this.addItem(householdMember)),takeUntilDestroyed()).subscribe({
            error: (err: any) => {
                console.log(err);
            },
        });

      
        this.delete$.pipe(exhaustMap((deleteObj) => this.deleteItem(deleteObj.householdId, deleteObj.userId)),takeUntilDestroyed()).subscribe({
            error: (err: any) => {
                console.log(err);
            },
        });
    }


    // // methods
    private getHouseholdMemberss(): Observable<TbHouseholdMembers[]> {
        // Pull initial data
        const initialTable$ = from(this.supabase
            .schema('public')
            .from(`tb_household_members`)
            .select(`
                *, 
                tb_profiles:user_id (
                    avatar_img,
                    display_name,
                    email
                )`)
        ).pipe(
            map((tableResult: PostgrestSingleResponse<any[]>) => (tableResult === null ? [] : tableResult.data)) // Handle null data case
        );

        // Populate Subject with changes from RealtimeChannel
        const tableChangesSubject = new Subject<any>();
        const householdMemberChannel = this.ngZone.runOutsideAngular(() => this.supabase.channel('internal-household-members-channel'));
        householdMemberChannel.on(
            'postgres_changes', 
            { event: '*', schema: 'public', table: 'tb_household_members' }, 
            (payload: any) => {
                tableChangesSubject.next(payload)
            }
        ).subscribe()

        // Handling Realtime changes to data
        const tableChanges$: Observable<any> = tableChangesSubject.asObservable().pipe(
            map((payload) => {
                const eventType = payload.eventType;
                const householdMembers = this.state().householdMembers; // Access state within RxJS chain
        
                if (eventType === 'INSERT') {
                    return [...householdMembers, payload.new];
                } else if (eventType === 'DELETE') {
                    const delIndex = householdMembers.findIndex(x => x.household_id === payload.old.household_id && x.user_id === payload.old.user_id);
                    return [...householdMembers.slice(0, delIndex-1), ...householdMembers.slice(delIndex, householdMembers.length)]
                } else {
                    return householdMembers;
                }
            }),
        );

        // Merge both Observables to create a single stream
        return merge(initialTable$, tableChanges$);
    }

    private addItem(household: any) {
        return this.supabase.schema('public').from('tb_household_members').insert([household])
    }

    private deletedId = -1
    private deleteItem(householdId: number, userId: string) {
        this.deletedId = householdId;
        return this.supabase.schema('public').from('tb_household_members').delete().eq('household_id', householdId).eq('user_id', userId).throwOnError()
    }
}
