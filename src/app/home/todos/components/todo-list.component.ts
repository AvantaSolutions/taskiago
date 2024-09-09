import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject, signal } from '@angular/core';
import { IonButton, IonCheckbox, IonCol, IonGrid, IonIcon, IonItem, IonLabel, IonList, IonRow, IonItemDivider } from '@ionic/angular/standalone';
import { TodosService } from '../../../shared/_data-access/todos.service';
import { TagsService, TbTagsWithText } from '../../../shared/_data-access/tags.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable, combineLatest, map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TbItems, TbTags } from 'src/app/shared/types/database';
import { SharedService } from 'src/app/shared/_data-access/shared.service';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { eye, eyeOff, eyeOffOutline, squareOutline } from 'ionicons/icons';
import { TodoComponent } from './todo.component';

interface TagWithAllocationInfo extends TbTagsWithText {
    count: number
}

interface Todos {
    active: any[],
    completed: any[]
}

@Component({
    selector: 'app-todo-list',
    template: `
    @if (todos$ | async; as todos) {
        <!-- todo allocation -->
        <div class="w-[90%] h-6 flex flex-row mx-auto mt-5">
            @for(tag of todoTags(); track $index) {
                <div [class.rounded-l-lg]="$index === 0" [class.rounded-r-lg]="$index === todoTags().length-1" style="overflow:hidden; height: 100%; width: {{calculateAllocation(tag)}}%; background-color: {{tag.color}}; color: {{tag.textColor}}"  title="{{tag.name}}" [style.filter]="tag.tag_id !== todosService.filter() && todosService.filter() !== -1 ? 'grayscale(0.95)' : ''" (click)="todosService.filter() === tag.tag_id ? todosService.filter$.next(-1) : todosService.filter$.next(tag.tag_id)"><span class="hidden md:block pl-2">{{tag.name}}</span></div>
            }
        </div>
        
        <ion-grid style="transition: all 1s ease-in">
            @for(todo of todos.active; track $index) {
                <ion-row >
                    <ion-col (click)="out(todos)">
                        <app-todo [todo]="todo"/>
                    </ion-col>
                </ion-row>
            }
            @empty {
                <ion-row>
                    <ion-col>
                        <ion-item>woah.... you've done it, nothing left to do!</ion-item>
                    </ion-col>
                </ion-row>
            }
            
            @if(todos.completed.length > 0) {
                <ion-row (click)="showCompleted.set(!showCompleted())" class="cursor-pointer">
                    <ion-col class="ion-text-center">
                        <ion-item-divider class="relative w-full" style="--background: white"> 
                            <ion-label class="w-full z-10">
                                <ion-icon [name]="showCompleted() === true ? 'eye-off' : 'eye'" class="bg-white pl-5 pr-2 -mb-[2px]"></ion-icon>
                                <span class="bg-white pr-5">{{showCompleted() === true ? 'Hide' : 'Show'}} Completed Checklist</span>
                            </ion-label>
                            <hr class="trailing-hr">
                        </ion-item-divider>
                    </ion-col>
                </ion-row>
            }
        @if(showCompleted() === true) {
                @for(todo of todos.completed; track $index) {
                <ion-row >
                    <ion-col (click)="out(todos)">
                       <app-todo [todo]="todo"/>
                    </ion-col>
                </ion-row>
                }
            }
        </ion-grid>
    }
    `,
    styles: `
    .trailing-hr {
        position: absolute;
        bottom: 0;
        left: 0;
        top: 23px;
        opacity: 0.5;
        right: 0;
        height: 1px; /* Adjust the height as needed */
        border: none;
        background-color: #ccc; /* Adjust the color as needed */
    }
    .no-padding {
        --padding-start: 0px !important;
    }`,
    standalone: true,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, IonCheckbox, IonCol, TodoComponent, IonGrid, IonItem, IonLabel, IonList, IonRow, IonButton, IonItemDivider, IonIcon],
})
export class todoComponent {
    sharedService = inject(SharedService);
    todosService = inject(TodosService);
    tagsService = inject(TagsService);

    todoTags = signal<TagWithAllocationInfo[]>([]);
    showCompleted = signal<boolean>(false);
    todos$: Observable<Todos> = combineLatest([
        toObservable(this.todosService.todos),
        toObservable(this.tagsService.tags),
        toObservable(this.todosService.filter)
    ]).pipe(map(([todos, tags, filter]) => {
        if (todos.length === 0 || tags.length === 0) return {active: [], completed: []};
        const itemsToReset = todos.filter(todo => todo.completed !== null && todo.frequency !== 0 && new Date(todo.completed).getTime() < this.sharedService.startDate.getTime())
        if (itemsToReset.length !== 0) {
            for (let item of itemsToReset) {
                if (item.frequency === 1 && new Date((item.completed as string)).getTime() > this.sharedService.startDate.getTime() - (1000 * 60 * 60 * 24 * 7))  {
                    this.todosService.update$.next({id: item.item_id, changes: {completed: null}})
                } else if (item.frequency === 2 && new Date((item.completed as string)).getTime() > this.sharedService.startDate.getTime() - (1000 * 60 * 60 * 24 * 14) && new Date((item.completed as string)).getTime() < this.sharedService.startDate.getTime() - (1000 * 60 * 60 * 24 * 7)) {
                    this.todosService.update$.next({id: item.item_id, changes: {completed: null}})
                } else if (item.frequency === 3 && new Date((item.completed as string)).getMonth() > this.sharedService.startDate.getMonth() - 1) {
                    this.todosService.update$.next({id: item.item_id, changes: {completed: null}})
                }
            }
        }
        let allTodos = todos.map(todo => ({
            ...todo,
            tag: tags.find(tag => tag.tag_id === todo.tag_id)?.name || '',
            color: tags.find(tag => tag.tag_id === todo.tag_id)?.color || ''
        }));
        // setting the top tag bar
        const tagsUsed = tags.filter(tag => allTodos.find(todo => todo.tag_id === tag.tag_id) !== undefined)
        const tagsWithCount = tagsUsed.map(tag => ({...tag, count: allTodos.filter(todos => todos.tag_id === tag.tag_id && todos.completed === null).length}))
        this.todoTags.set(tagsWithCount.filter(tag => tag.count > 0));
        // setting any filter
        if (filter !== -1) { allTodos = allTodos.filter(todo => todo.tag_id === filter)}
        const active = allTodos.filter(todos => todos.completed === null)
        const completed = allTodos.filter(todo => todo.completed !== null && (new Date(todo.completed).getTime() > this.sharedService.startDate.getTime() || todo.frequency !== 0))
        return { active, completed }
    }))

    constructor() {
        addIcons({ eye, eyeOffOutline, eyeOff })
    }
    
    calculateAllocation(tag: TagWithAllocationInfo) {
       return tag.count/this.todoTags().reduce((sum, curr) => sum+curr.count, 0) * 100;
    }

    out(item: any) { console.log(item)}
}
