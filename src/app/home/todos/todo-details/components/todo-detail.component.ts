import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, inject } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonItem, IonButtons, IonButton, IonInput, IonList, IonSelect, IonSelectOption, IonChip} from '@ionic/angular/standalone';
import { ReplaySubject, combineLatest, debounceTime, distinctUntilChanged, map, takeUntil, tap } from 'rxjs';
import { TagsService } from 'src/app/shared/_data-access/tags.service';
import { TodosService } from 'src/app/shared/_data-access/todos.service';
import { TbItems } from 'src/app/shared/types/database';

@Component({
    selector: 'app-todo-detail',
    template: `
    @if(selectedTodo$ | async; as selectedTodo) {
        <ion-list [formGroup]="form">
            <ion-item>
                <ion-input label="Todo Label" formControlName="label"></ion-input>
            </ion-item>
            <ion-item>
                <ion-select label="Select a tag" interface="popover" formControlName="tag_id" required>
                    @for(tag of tagsService.tags(); track $index) {
                        <ion-select-option [value]="tag.tag_id">{{tag.name}} <span class="rounded-full w-10 h-10" [style.background-color]="tag.color"></span></ion-select-option>
                    }
                </ion-select>
            </ion-item>
            <ion-item>
                <ion-select label="Does the Task repeat?" interface="popover" formControlName="frequency" required>
                    <ion-select-option [value]="0">Does not repeat</ion-select-option>
                    <ion-select-option [value]="1">Weekly</ion-select-option>
                    <ion-select-option [value]="2">Bi-Weekly</ion-select-option>
                    <ion-select-option [value]="3">Month</ion-select-option>
                </ion-select>
            </ion-item>

            <ion-item>
                @for(day of repeatDays; track $index) {
                    <ion-chip [outline]="day.value" (click)="day.value = !day.value">{{day.day.slice(0,2)}}</ion-chip>
                }
            </ion-item>
            
            <ion-item>Created on {{selectedTodo.created_at | date: 'shortDate'}}</ion-item>
            @if(selectedTodo.completed !== null) { <ion-item>Completed on {{selectedTodo.completed | date: 'shortDate'}}</ion-item>}
        </ion-list>
       
      
        <ion-buttons>
            <ion-button color="primary" (click)="toggleTodo(selectedTodo)">Mark as {{selectedTodo.completed === null ? 'complete' : 'incomplete'}}</ion-button>
            <ion-button color="danger" (click)="deleteTodo(selectedTodo)">Delete</ion-button>
        </ion-buttons>
    }
    `,
    styles: `
    ion-chip:not(.chip-outline) {
        background-color: blue !important;
    }
    `,
    standalone: true,
    // changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [IonItem, IonButtons, IonButton, IonInput, IonList, IonSelect, IonSelectOption, IonChip,CommonModule, ReactiveFormsModule],
})
export class TodoDetailComponent implements OnDestroy {
    private fb = inject(FormBuilder)
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    todosService = inject(TodosService);
    tagsService = inject(TagsService);
    destroy$ = new ReplaySubject<boolean>(1);

    repeatDays = [
        {
            day: 'Sunday',
            value: false,
        },
        {
            day: 'Monday',
            value: false,
        },
        {
            day: 'Tuesday',
            value: false,
        },
        {
            day: 'Wednesday',
            value: false,
        },
        {
            day: 'Thursday',
            value: false,
        },
        {
            day: 'Friday',
            value: false,
        },
        {
            day: 'Saturday',
            value: false,
        }
    ]

    form = this.fb.nonNullable.group({
        label: ['', Validators.required],
        tag_id: [-1, Validators.required],
        frequency: [0, Validators.required]
    })

    selectedTodo$ = combineLatest([
        this.route.params,
        toObservable(this.todosService.todos)
    ]).pipe(
        map(([params, todos]) => todos.find(todo => todo.item_id === +params['id'])),
        tap(selectedTodo => {
            if (selectedTodo === undefined) return;
            this.form.patchValue({
                label: selectedTodo.label,
                tag_id: selectedTodo.tag_id,
                frequency: selectedTodo.frequency || 0
            }, {emitEvent: false})

            this.form.get('label')?.valueChanges.pipe(debounceTime(1000), distinctUntilChanged(), takeUntil(this.destroy$)).subscribe(label => {
                this.todosService.update$.next({id: selectedTodo.item_id, changes: {label} })
            })
            this.form.get('tag_id')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(tag_id => {
                this.todosService.update$.next({id: selectedTodo.item_id, changes: {tag_id} })
            })
            this.form.get('frequency')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(frequency => {
                this.todosService.update$.next({id: selectedTodo.item_id, changes: {frequency} })
            })
        })
    )

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    toggleTodo(selectedTodo: TbItems) {
        if (selectedTodo.completed === null) {
            this.todosService.update$.next({id: selectedTodo.item_id, changes: {completed: new Date().toISOString()}})
        } else {
            this.todosService.update$.next({id: selectedTodo.item_id, changes: {completed: null}})
        }
    }

    deleteTodo(selectedTodo: TbItems) {
        this.todosService.delete$.next(selectedTodo.item_id);
        this.router.navigate(['/home'])
    }
}
