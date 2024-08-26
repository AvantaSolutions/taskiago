import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonSelect,IonButton, IonSelectOption  } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/shared/_data-access/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-settings',
    template: `
    <ion-header [translucent]="true">
        <ion-toolbar color="primary">
            <ion-title>Settings</ion-title>
        </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
        <ion-header collapse="condense">
            <ion-toolbar color="primary">
                <ion-title size="large">Settings</ion-title>
            </ion-toolbar>
        </ion-header>
        <section [formGroup]="settingsForm">
            <ion-item>
                Household
                <ion-button slot="end">chevron_right</ion-button>
            </ion-item>
            <ion-item>
                <ion-select label="Start of Week" interface="popover" formControlName="startOfWeek" required>
                    <ion-select-option [value]="0">Sunday</ion-select-option>
                    <ion-select-option [value]="1">Monday</ion-select-option>
                </ion-select>
            </ion-item>
            <ion-item>Email: {{authService.currentUser()?.email}}</ion-item>
            <ion-item (click)="logout()">Sign Out</ion-item>
        </section>

    </ion-content>
    `,
    styles: ``,
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [IonContent, IonHeader, IonTitle, IonButton, IonToolbar, IonItem, IonSelect, IonSelectOption, CommonModule, ReactiveFormsModule, FormsModule]
})
export default class SettingsPage {
    public authService = inject(AuthService);
    private router = inject(Router);
    private fb = inject(FormBuilder);
    settingsForm = this.fb.nonNullable.group({
        startOfWeek: [0]
    })

    logout() {
        this.authService.logout();
        this.router.navigate(['/login'])
    }
}