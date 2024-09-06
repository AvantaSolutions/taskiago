import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonModal, IonSelect, IonSelectOption, IonCheckbox, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { OverlayEventDetail } from '@ionic/core/components';
import { TagsService, TbTagsWithText } from '../../../shared/_data-access/tags.service';
import { TodosService } from '../../../shared/_data-access/todos.service';

@Component({
    selector: 'app-todo-modal',
    template: `
    <ion-modal #modal trigger="open-modal" (willDismiss)="onWillDismiss($event)" (willPresent)="form.get('tag_id')?.setValue(todosService.filter())">
        <ng-template>
            <ion-header>
                <ion-toolbar style="--background: {{selectedTag?.color}}; --color: {{selectedTag?.textColor}}">
                    <ion-buttons slot="start">
                        <ion-button (click)="modal.dismiss(null, 'cancel')">Cancel</ion-button>
                    </ion-buttons>
                    <ion-title>Add a new Todo</ion-title>
                    <ion-buttons slot="end">
                        <ion-button (click)="modal.dismiss(null, 'confirm')" [strong]="true" [disabled]="form.invalid">Confirm</ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>
            <ion-content class="ion-padding" [formGroup]="form">
                <ion-item>
                    <ion-input type="text" formControlName="label" label="Enter the task title" labelPlacement="floating"/>
                </ion-item>
                
                <ion-item>
                    <ion-select label="Select a tag" label-placement="floating" formControlName="tag_id" required>
                        @for(tag of tagsService.tags(); track $index) {
                            <ion-select-option [value]="tag.tag_id">{{tag.name}} <span class="rounded-full w-10 h-10" [style.background-color]="tag.color"></span></ion-select-option>
                        }
                    </ion-select>
                </ion-item>
                @if(!!selectedTag && selectedTag.households !== null) {
                    <ion-item>
                        <ion-checkbox labelPlacement="start" [formControl]="shareWithHouseholds">Share with Tag Household</ion-checkbox>
                    </ion-item>
                }
                <ion-item>
                    <ion-select label="Does the Task repeat?" interface="popover" formControlName="frequency" required>
                        <ion-select-option [value]="0">Does not repeat</ion-select-option>
                        <ion-select-option [value]="1">Weekly</ion-select-option>
                        <ion-select-option [value]="2">Bi-Weekly</ion-select-option>
                        <ion-select-option [value]="3">Month</ion-select-option>
                    </ion-select>
                </ion-item>
            </ion-content>
        </ng-template>
    </ion-modal>
    `,
    styles: ``,
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ ReactiveFormsModule, IonModal, IonButtons, IonCheckbox, IonButton, IonItem, IonInput, IonHeader, IonTitle, IonToolbar, IonContent, IonSelect, IonSelectOption],
})
export class TodoModalComponent {
    tagsService = inject(TagsService);
    todosService = inject(TodosService);
    fb = inject(FormBuilder);
    selectedTag?: TbTagsWithText;

    form = this.fb.nonNullable.group({
        label: ['', Validators.required],
        tag_id: [this.todosService.filter(), Validators.required],
        households: this.fb.control<null|number[]>(null),
        frequency: [0, Validators.required],
    })
    shareWithHouseholds = this.fb.control(false);

    constructor() {
        this.shareWithHouseholds.valueChanges.pipe(takeUntilDestroyed()).subscribe(household => {
            console.log(household)
            this.form.get('households')?.setValue(household === false || this.selectedTag === undefined ? null : this.selectedTag.households)
        })
        this.form.get('tag_id')?.valueChanges.pipe(takeUntilDestroyed()).subscribe(tag_id => {
            this.selectedTag = this.tagsService.tags().find(tag => tag.tag_id === tag_id)
            if (!!this.selectedTag && this.selectedTag.households !== null) {
                this.shareWithHouseholds.setValue(true);
            }
        })
      
    }
    onWillDismiss(event: Event) {
        const ev = event as CustomEvent<OverlayEventDetail<string>>;
        if (ev.detail.role === 'confirm') {
            this.todosService.add$.next(this.form.getRawValue())
            this.form.reset();
        }
    }
}
