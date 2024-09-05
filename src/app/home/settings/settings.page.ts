import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonSelect,IonButton, IonSelectOption,  IonAvatar, IonLabel, IonIcon  } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/shared/_data-access/auth.service';
import { Router, RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { chevronForward, chevronForwardOutline } from 'ionicons/icons';
import { SharedService } from 'src/app/shared/_data-access/shared.service';

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
                <ion-avatar slot="start">
                    <img alt="Silhouette of a person's head" [src]="profilePicture()" />
                </ion-avatar>
                <ion-label>Profile</ion-label>              
            </ion-item>
            <ion-item (click)="navigate('household')">
                Household
                <ion-icon slot="end" name="chevron-forward-outline"></ion-icon>
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
    imports: [IonContent, IonHeader, IonAvatar, IonLabel ,IonTitle, IonButton, IonToolbar, IonItem, IonIcon, IonSelect, IonSelectOption, CommonModule, ReactiveFormsModule, FormsModule]
})
export default class SettingsPage {
    public authService = inject(AuthService);
    private router = inject(Router);
    private fb = inject(FormBuilder);
    settingsForm = this.fb.nonNullable.group({
        startOfWeek: [0]
    })
    profilePicture = computed(() => {
        if (this.authService.currentUser() === null || this.authService.currentUser() === undefined) return 'https://ionicframework.com/docs/img/demos/avatar.svg'
        const avatarUrl = this.authService.currentUser()?.user_metadata['avatar_url'];
        return !!avatarUrl ? avatarUrl : 'https://ionicframework.com/docs/img/demos/avatar.svg'
    })

    constructor() {
        addIcons({ chevronForwardOutline})
    }

    navigate(destination: string) {
        this.router.navigate(['/home/settings/'+destination])
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login'])
    }
}