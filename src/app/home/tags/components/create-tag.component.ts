import { ChangeDetectionStrategy, Component, ViewChild, inject } from '@angular/core';
import { IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonModal, IonSelect, IonSelectOption, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { OverlayEventDetail } from '@ionic/core/components';
import { TagsService } from '../../../shared/_data-access/tags.service';
import { TodosService } from '../../../shared/_data-access/todos.service';
import { NgxColorsModule } from 'ngx-colors';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-tag-modal',
    template: `
    <ion-modal #modal trigger="create-tag-modal" (willDismiss)="onWillDismiss($event)">
        <ng-template>
            <ion-header>
                <ion-toolbar style="--background: {{color}}; --color: {{textColor}}">
                    <ion-buttons slot="start">
                        <ion-button (click)="modal.dismiss(null, 'cancel')">Cancel</ion-button>
                    </ion-buttons>
                    <ion-title>Add a New Tag</ion-title>
                    <ion-buttons slot="end">
                        <ion-button (click)="modal.dismiss(null, 'confirm')" [strong]="true" [disabled]="form.invalid">Confirm</ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>
            <ion-content class="ion-padding" [formGroup]="form">
                <ion-item>
                    <ion-input type="text" formControlName="name" label="Enter the tag name" labelPlacement="floating"/>
                </ion-item>
                <ion-item class="relative">
                <ion-input type="text" [value]="color" label="Enter the tag color" labelPlacement="floating" disabled style="opacity: 1"/>
                <ngx-colors
                #ngxColor
                ngx-colors-trigger
                [hideTextInput]="true"
                [hideColorPicker]="false"
                colorPickerControls="no-alpha"
                formControlName="color"/>
                </ion-item>
            </ion-content>
        </ng-template>
    </ion-modal>
    `,
    styles: ``,
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ ReactiveFormsModule, IonModal, IonButtons, IonButton, IonItem, IonInput, NgxColorsModule, IonHeader, IonTitle, IonToolbar, IonContent, IonSelect, IonSelectOption],
})
export class TagModalComponent {
    tagsService = inject(TagsService);
    todosService = inject(TodosService);
    fb = inject(FormBuilder);
    color = '#fff';
    textColor: 'black'|'white' = 'black';

    form = this.fb.nonNullable.group({
        name: ['', Validators.required],
        color: ['#fff', Validators.required],
    })

    constructor() {
        this.form.get('color')?.valueChanges.pipe(takeUntilDestroyed()).subscribe((color) => {
            this.color = color;
            this.textColor = this.tagsService.hexToRgb(color)
        })
    }
    onWillDismiss(event: Event) {
        const ev = event as CustomEvent<OverlayEventDetail<string>>;
        if (ev.detail.role === 'confirm') {
            this.tagsService.add$.next(this.form.getRawValue())
            this.form.reset();
        }
    }
}
