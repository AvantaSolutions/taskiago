import { Injectable, NgZone, computed, inject, signal } from "@angular/core";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { Observable, Subject, exhaustMap, filter, from, map, merge, of, retry, switchMap } from "rxjs";
import { SupabaseService } from "src/app/shared/_data-access/supabase.service";
import { TbTags, UpdateTbTags } from "../types/database";
import { ToastController } from '@ionic/angular/standalone'
import { AuthService } from "./auth.service";

export interface TbTagsWithText extends TbTags {
    textColor: 'black'|'white'
}
interface TagsState {
    tags: TbTagsWithText[]
}

@Injectable({
  providedIn: 'root'
})
export class TagsService {
    private toastController = inject(ToastController)
    private readonly ngZone = inject(NgZone);
    private supabaseService = inject(SupabaseService);
    private authService = inject(AuthService);
    private supabase = this.supabaseService.client;

    // sources
    #tags$ = this.getTags().pipe(
        retry({
            delay: () => toObservable(this.authService.currentUser).pipe(filter((user) => !!user))
        })
    )
    add$ = new Subject<any>();
    update$ = new Subject<{id: number, changes: UpdateTbTags}>();
    select$ = new Subject<any|null>();
    delete$ = new Subject<number>();
    setFilter$ = new Subject<string>();
    error$ = new Subject<string>();

    // state
    private state = signal<TagsState>({
        tags: [],
    })

    // selectors
    tags = computed(() => this.state().tags);

    constructor() {
        this.#tags$.pipe(takeUntilDestroyed()).subscribe((tags) =>{
            const sortedTags = tags.sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            const tagWTxtColor = tags.map(tag => ({...tag, textColor: this.hexToRgb(tag.color)}))
            const changes: Partial<TagsState> = {
                tags: tagWTxtColor
            }
         
            this.state.update((state) => {
                return { ...state, ...changes}
            })
        });

        this.add$.pipe(exhaustMap((tag) => this.addItem(tag)),takeUntilDestroyed()).subscribe({
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
            }
        });

        this.delete$.pipe(exhaustMap((todoId) => this.deleteItem(todoId)),takeUntilDestroyed()).subscribe({
            error: (err: any) => {
                console.log(err);
            },
        });
    }


    // // methods
    private getTags(): Observable<TbTags[]> {
        // Pull initial data
        const initialTable$ = from(this.supabase
            .schema('public')
            .from(`tb_tags`)
            .select("*")
        ).pipe(
            map((tableResult: PostgrestSingleResponse<any[]>) => (tableResult === null ? [] : tableResult.data)) // Handle null data case
        );

        // Populate Subject with changes from RealtimeChannel
        const tableChangesSubject = new Subject<any>();
        const tagChannel = this.ngZone.runOutsideAngular(() => this.supabase.channel('internal-tags-channel'));
        tagChannel.on(
            'postgres_changes', 
            { event: '*', schema: 'public', table: 'tb_tags' }, 
            (payload: any) => {
                tableChangesSubject.next(payload)
            }
        ).subscribe()

        // Handling Realtime changes to data
        const tableChanges$: Observable<any> = tableChangesSubject.asObservable().pipe(
            map((payload) => {
                const eventType = payload.eventType;
                const tags = this.state().tags; // Access state within RxJS chain
        
                if (eventType === 'UPDATE') {
                    const itemIndex = tags.findIndex(x => x.tag_id === payload.old.tag_id);
                    return [
                        ...tags.slice(0, itemIndex),
                        ...[
                            {
                                ...tags[itemIndex],
                                ...payload.new,
                            },
                        ],
                        ...tags.slice(itemIndex + 1),
                    ];
                } else if (eventType === 'INSERT') {
                    return [...tags, payload.new];
                } else if (eventType === 'DELETE') {
                    return tags.filter(x => x.tag_id !== payload.old.tag_id);
                } else {
                    return tags;
                }
            }),
        );

        // Merge both Observables to create a single stream
        return merge(initialTable$, tableChanges$);
    }

    private addItem(tag: any) {
        return this.supabase.schema('public').from('tb_tags').insert([tag])
    }

    private updateItem(tagId: number, tag: UpdateTbTags) {
        return this.supabase.schema('public').from('tb_tags').update(tag).eq('tag_id', tagId)
    }
    
    private deletedId = -1
    private deleteItem(tagId: number) {
        this.deletedId = tagId;
        return this.supabase.schema('public').from('tb_tags').delete().eq('tag_id', tagId).throwOnError()
    }

      
    
    hexToRgb(hex: string): 'black'|'white' {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        const rgb = result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null;
        if (rgb === null) return `black`
        const luminance = 0.2126 * rgb.r/255 + 0.7152 * rgb.g/255 + 0.0722 * rgb.b/255;
        return luminance >= 0.179 ? 'black' : 'white'
    }
}
