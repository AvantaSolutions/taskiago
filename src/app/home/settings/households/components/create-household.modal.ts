import { ChangeDetectionStrategy, Component, ViewChild, inject } from '@angular/core';
import { IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonModal, IonSelect, IonSelectOption, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { OverlayEventDetail } from '@ionic/core/components';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { HouseholdService } from 'src/app/shared/_data-access/household.service';

@Component({
    selector: 'app-create-household-modal',
    template: `
    <ion-modal #modal trigger="create-household-modal" (willDismiss)="onWillDismiss($event)">
        <ng-template>
            <ion-header>
                <ion-toolbar color="primary">
                    <ion-buttons slot="start">
                        <ion-button (click)="modal.dismiss(null, 'cancel')">Cancel</ion-button>
                    </ion-buttons>
                    <ion-title>Create a New Household</ion-title>
                    <ion-buttons slot="end">
                        <ion-button (click)="modal.dismiss(null, 'confirm')" [strong]="true">Confirm</ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>
            <ion-content class="ion-padding" [formGroup]="form">
                <ion-item>
                    <ion-input type="text" formControlName="name" label="Enter a name for the household" placeholder="Family, Team, etc..." labelPlacement="floating"/>
                </ion-item>
            </ion-content>
        </ng-template>
    </ion-modal>
    `,
    styles: ``,
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ ReactiveFormsModule, IonModal, IonButtons, IonButton, IonItem, IonInput, IonHeader, IonTitle, IonToolbar, IonContent, IonSelect, IonSelectOption],
})
export class CreateHouseholdModal {
    householdService = inject(HouseholdService);
    fb = inject(FormBuilder);

    form = this.fb.nonNullable.group({
        name: ['', Validators.required],
    })
    onWillDismiss(event: Event) {
        const ev = event as CustomEvent<OverlayEventDetail<string>>;
        if (ev.detail.role === 'confirm') {
            this.householdService.add$.next(this.form.getRawValue());
            this.form.reset();
        }
    }
}
