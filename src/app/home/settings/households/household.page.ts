import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonButtons, IonFab,IonFabButton, IonIcon, IonBackButton, IonSelect,IonButton, IonGrid, IonRow, IonCol, IonSelectOption, IonLabel  } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/shared/_data-access/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import { QrCodeModule } from 'ng-qrcode';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HouseholdService } from 'src/app/shared/_data-access/household.service';
import { CreateHouseholdModal } from './components/create-household.modal';
import { HouseholdMembersService } from 'src/app/shared/_data-access/household-members.service';

@Component({
    selector: 'app-settings',
    template: `
   <ion-header [translucent]="true">
        <ion-toolbar color="primary">
            <ion-buttons slot="start">
                <ion-back-button defaultHref="/home/settings"></ion-back-button>
            </ion-buttons>
            <ion-title>Household</ion-title>
        </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
        <ion-header collapse="condense">
            <ion-toolbar color="primary">
                <ion-buttons slot="start">
                    <ion-back-button defaultHref="/home/settings"></ion-back-button>
                </ion-buttons>
                <ion-title>Household</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-grid style="transition: all 1s ease-in">
            @for(household of householdService.households(); track $index) {
                <ion-row >
                    <ion-col>
                        <ion-item class="relative border rounded-lg no-padding shadow-sm">
                            <ion-label (click)="router.navigate(['/home/settings/household', household.household_id])">{{household.name}}</ion-label>
                        </ion-item>
                    </ion-col>
                </ion-row>
            }
            @empty {
                <ion-row>
                    <ion-col>
                        <ion-item>You do not have any households associated with you, please either create a new household or scan a household QR Code</ion-item>
                    </ion-col>
                </ion-row>
            }
        </ion-grid>

        <app-create-household-modal/>
    </ion-content>
            
            
    <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button id="create-household-modal" expand="block">
            <ion-icon name="add"></ion-icon>
        </ion-fab-button>
    </ion-fab>
    `,
    styles: ``,
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [IonContent, CreateHouseholdModal, IonHeader, IonGrid, IonLabel, IonRow, IonCol, CommonModule, IonFab,IonFabButton, IonIcon ,IonTitle, QrCodeModule,IonButton, IonButtons, IonBackButton, IonToolbar, IonItem, IonSelect, IonSelectOption, CommonModule, ReactiveFormsModule, FormsModule]
})
export default class HouseholdPage {
    private authService = inject(AuthService);
    householdService = inject(HouseholdService)
    householdMemberService = inject(HouseholdMembersService)
    router = inject(Router);
    route = inject(ActivatedRoute);
  

    constructor() {
        this.route.queryParams.pipe(takeUntilDestroyed()).subscribe(params => {
            if (params['join'] === undefined) return;
            const decrypted = CryptoJS.AES.decrypt(params['join'], environment.cipher).toString(CryptoJS.enc.Utf8).split(`<(•'.'•)>`)
            const user = decrypted[0];
            const householdId = decrypted[1]
            if (user === this.authService.currentUser()?.id) return;
            this.householdMemberService.add$.next({household_id: householdId, user_id: this.authService.currentUser()?.id})
            console.log("DONE", decrypted)
            // const modal = this.modalCtrl.create({
            //     component: JoinHouseholdComponent,
            // });
            // modal.present();
        })
    }
}