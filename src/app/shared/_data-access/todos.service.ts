import { Injectable, NgZone, computed, inject, signal } from "@angular/core";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { Observable, Subject, exhaustMap, filter, from, map, merge, of, retry, switchMap } from "rxjs";
import { SupabaseService } from "src/app/shared/_data-access/supabase.service";
import { InsertTbItems, TbItems, UpdateTbItems } from "src/app/shared/types/database";
import { ToastController } from '@ionic/angular/standalone'
import { AuthService } from "./auth.service";

interface TodoState {
    todos: TbItems[],
    selected: TbItems|null,
    tagFilter: number
}

@Injectable({
  providedIn: 'root'
})
export class TodosService {
    private toastController = inject(ToastController)
    private readonly ngZone = inject(NgZone);
    private supabaseService = inject(SupabaseService);
    private authService = inject(AuthService);
    private supabase = this.supabaseService.client;

    // sources
    #todos$ = this.getTodos().pipe(
        retry({
            delay: () => toObservable(this.authService.currentUser).pipe(filter((user) => !!user))
        })
    )
    add$ = new Subject<InsertTbItems>();
    update$ = new Subject<{id: number, changes: UpdateTbItems}>();
    delete$ = new Subject<number>();
    error$ = new Subject<string>();
    filter$ = new Subject<number>()

    // state
    private state = signal<TodoState>({
        todos: [],
        selected: null,
        tagFilter: -1
    })

    // selectors
    todos = computed(() => this.state().todos);
    filter = computed(() => this.state().tagFilter);

    constructor() {
        this.#todos$.pipe(takeUntilDestroyed()).subscribe((todos) =>{
            const sortedtodos = todos.sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            const changes: Partial<TodoState> = {
                todos: sortedtodos
            }
         
            this.state.update((state) => {
                return { ...state, ...changes}
            })
        });

        this.add$.pipe(exhaustMap((todo) => this.addItem(todo)),takeUntilDestroyed()).subscribe({
            error: (err: any) => {
                console.log(err);
            },
        });

        this.update$.pipe(switchMap((updateObj) =>  this.updateItem(updateObj.id, updateObj.changes)),takeUntilDestroyed()).subscribe({
            next: () => {
                this.toastController.create({
                    message: 'Item Updated',
                    duration: 1500,
                    position: 'bottom',
                }).then(toast => {
                    toast.present()
                });
            },
            error: (err: any) => {
                console.log(err);
            },
        });

        this.delete$.pipe(exhaustMap((todoId) => this.deleteItem(todoId)),takeUntilDestroyed()).subscribe({
            error: (err: any) => {
                console.log(err);
            },
        });

        this.filter$.pipe(exhaustMap((filter) => of(this.state.update(state => ({...state, tagFilter: filter})))),takeUntilDestroyed()).subscribe({
            error: (err: any) => {
                console.log(err);
            },
        });
    }


    // // methods
    private getTodos(): Observable<TbItems[]> {
        // Pull initial data
        const initialTable$ = from(this.supabase
            .schema('public')
            .from(`tb_items`)
            .select("*")
        ).pipe(
            map((tableResult: PostgrestSingleResponse<any[]>) => (tableResult === null ? [] : tableResult.data)) // Handle null data case
        );

        // Populate Subject with changes from RealtimeChannel
        const tableChangesSubject = new Subject<any>();
        const todoChannel = this.ngZone.runOutsideAngular(() => this.supabase.channel('internal-todos-channel'));
        todoChannel.on(
            'postgres_changes', 
            { event: '*', schema: 'public', table: 'tb_items' }, 
            (payload: any) => {
                tableChangesSubject.next(payload)
            }
        ).subscribe()

        // Handling Realtime changes to data
        const tableChanges$: Observable<any> = tableChangesSubject.asObservable().pipe(
            map((payload) => {
                const eventType = payload.eventType;
                const todos = this.state().todos; // Access state within RxJS chain
        
                if (eventType === 'UPDATE') {
                    const itemIndex = todos.findIndex(x => x.item_id === payload.old.item_id);
                    return [
                        ...todos.slice(0, itemIndex),
                        ...[
                            {
                                ...todos[itemIndex],
                                ...payload.new,
                            },
                        ],
                        ...todos.slice(itemIndex + 1),
                    ];
                } else if (eventType === 'INSERT') {
                    return [...todos, payload.new];
                } else if (eventType === 'DELETE') {
                    return todos.filter(x => x.item_id !== payload.old.item_id);
                } else {
                    return todos;
                }
            }),
        );

        // Merge both Observables to create a single stream
        return merge(initialTable$, tableChanges$);
    }

    private addItem(todo: any) {
        return this.supabase.schema('public').from('tb_items').insert([todo])
    }

    private updateItem(id: number, changes: UpdateTbItems) {
        return this.supabase.schema('public').from('tb_items').update(changes).eq('item_id', id)
    }
    
    private deletedId = -1
    private deleteItem(todoId: number) {
        this.deletedId = todoId;
        return this.supabase.schema('public').from('tb_items').delete().eq('item_id', todoId).throwOnError()
    }
}
