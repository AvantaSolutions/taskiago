import { Injectable, NgZone, computed, inject, signal } from "@angular/core";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { Observable, Subject, exhaustMap, filter, from, map, merge, of, retry, switchMap } from "rxjs";
import { SupabaseService } from "src/app/shared/_data-access/supabase.service";
import { TbHouseholds, UpdateTbHouseholds } from "../types/database";
import { AuthService } from "./auth.service";

interface HouseholdsState {
    households: TbHouseholds[]
}

@Injectable({
  providedIn: 'root'
})
export class HouseholdService {
    private readonly ngZone = inject(NgZone);
    private supabaseService = inject(SupabaseService);
    private authService = inject(AuthService);
    private supabase = this.supabaseService.client;

    // sources
    #households$ = this.getHouseholds().pipe(
        retry({
            delay: () => toObservable(this.authService.currentUser).pipe(filter((user) => !!user))
        })
    )
    add$ = new Subject<any>();
    update$ = new Subject<{id: number, changes: UpdateTbHouseholds}>();
    select$ = new Subject<any|null>();
    delete$ = new Subject<number>();
    error$ = new Subject<string>();

    // state
    private state = signal<HouseholdsState>({
        households: [],
    })

    // selectors
    households = computed(() => this.state().households);

    constructor() {
        this.#households$.pipe(takeUntilDestroyed()).subscribe((households) =>{
            const sortedHouseholds = households.sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            const changes: Partial<HouseholdsState> = {
                households: sortedHouseholds
            }
         
            this.state.update((state) => {
                return { ...state, ...changes}
            })
        });

        this.add$.pipe(exhaustMap((household) => this.addItem(household)),takeUntilDestroyed()).subscribe({
            error: (err: any) => {
                console.log(err);
            },
        });

        this.update$.pipe(switchMap((updateObj) =>  this.updateItem(updateObj.id, updateObj.changes)),takeUntilDestroyed()).subscribe({
            error: (err: any) => {
                console.log(err);
            }
        });

        this.delete$.pipe(exhaustMap((todoId) => this.deleteItem(todoId)),takeUntilDestroyed()).subscribe({
            error: (err: any) => {
                console.log(err);
            },
        });
    }


    // // methods
    private getHouseholds(): Observable<TbHouseholds[]> {
        // Pull initial data
        const initialTable$ = from(this.supabase
            .schema('public')
            .from(`tb_households`)
            .select("*")
        ).pipe(
            map((tableResult: PostgrestSingleResponse<any[]>) => (tableResult === null ? [] : tableResult.data)) // Handle null data case
        );

        // Populate Subject with changes from RealtimeChannel
        const tableChangesSubject = new Subject<any>();
        const householdChannel = this.ngZone.runOutsideAngular(() => this.supabase.channel('internal-households-channel'));
        householdChannel.on(
            'postgres_changes', 
            { event: '*', schema: 'public', table: 'tb_households' }, 
            (payload: any) => {
                tableChangesSubject.next(payload)
            }
        ).subscribe()

        // Handling Realtime changes to data
        const tableChanges$: Observable<any> = tableChangesSubject.asObservable().pipe(
            map((payload) => {
                const eventType = payload.eventType;
                const households = this.state().households; // Access state within RxJS chain
        
                if (eventType === 'UPDATE') {
                    const itemIndex = households.findIndex(x => x.household_id === payload.old.household_id);
                    return [
                        ...households.slice(0, itemIndex),
                        ...[
                            {
                                ...households[itemIndex],
                                ...payload.new,
                            },
                        ],
                        ...households.slice(itemIndex + 1),
                    ];
                } else if (eventType === 'INSERT') {
                    return [...households, payload.new];
                } else if (eventType === 'DELETE') {
                    return households.filter(x => x.household_id !== payload.old.household_id);
                } else {
                    return households;
                }
            }),
        );

        // Merge both Observables to create a single stream
        return merge(initialTable$, tableChanges$);
    }

    private addItem(household: any) {
        return this.supabase.schema('public').from('tb_households').insert([household])
    }

    private updateItem(householdId: number, household: UpdateTbHouseholds) {
        return this.supabase.schema('public').from('tb_households').update(household).eq('household_id', householdId)
    }
    
    private deletedId = -1
    private deleteItem(householdId: number) {
        this.deletedId = householdId;
        return this.supabase.schema('public').from('tb_households').delete().eq('household_id', householdId).throwOnError()
    }
}
