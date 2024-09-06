import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonButtons, IonBackButton, IonSelect, IonButton, IonAvatar, IonList, IonInput, IonItemSliding, IonItemGroup, IonItemDivider, IonItemOptions, IonItemOption, IonLabel, IonSelectOption  } from '@ionic/angular/standalone';
import { QrCodeModule } from 'ng-qrcode';
import { Observable, combineLatest, map, of, take, tap } from 'rxjs';
import * as CryptoJS from 'crypto-js';
import { AuthService } from 'src/app/shared/_data-access/auth.service';
import { HouseholdService } from 'src/app/shared/_data-access/household.service';
import { environment } from 'src/environments/environment';
import { HouseholdMembersService } from 'src/app/shared/_data-access/household-members.service';
import { TbHouseholds } from 'src/app/shared/types/database';

@Component({
    selector: 'app-household-detail-page',
    template: `
    @if(selectedHousehold$ | async; as selectedHousehold) {
        <ion-content [fullscreen]="true">
            <ion-header>
                <ion-toolbar color="primary">
                    <ion-buttons slot="start">
                        <ion-back-button defaultHref="/home/settings/household"></ion-back-button>
                    </ion-buttons>
                    <ion-title>{{selectedHousehold.name}} - Household</ion-title>
                </ion-toolbar>
            </ion-header>
            <section >
                <ion-list>
                @if(qrCode$ | async; as qrCode){
                <ion-item class="w-full">
                    <qr-code [value]="qrCode" class="mx-auto"
                        size="300" 
                        errorCorrectionLevel="M" />
                </ion-item>
                }
              
                    
                    <ion-item-group>
                        <ion-item-divider>
                            <ion-label>Information</ion-label>
                        </ion-item-divider> 
                        <ion-item>
                            <ion-input label="Household Name" formControlName="name"></ion-input>
                        </ion-item>
                    </ion-item-group>
                    <ion-item-group>
                        <ion-item-divider>
                            <ion-label>Members</ion-label>
                        </ion-item-divider>
                    @for(member of selectedHousehold.members; track $index) {
                        <ion-item-sliding>
                            <ion-item>
                                <ion-avatar slot="start">
                                    <img alt="Silhouette of a person's head" [src]="member.avatar_img" />
                                </ion-avatar>
                                <ion-label>{{member.display_name}}</ion-label>
                            </ion-item>

                            <ion-item-options>
                                <ion-item-option color="danger" (click)="removeMember(member, selectedHousehold)" [disabled]="member.user_id === selectedHousehold.created_by">Delete</ion-item-option>
                            </ion-item-options>
                        </ion-item-sliding>
                    } @empty {
                        <ion-item>No members in this household</ion-item>
                    }
                    </ion-item-group>
                </ion-list>

            </section>
        </ion-content>
    }
    `,
    styles: ``,
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [IonContent, IonHeader, CommonModule, IonAvatar, IonList, IonInput, IonItemDivider, IonItemGroup, IonItemSliding, IonItemOptions, IonItemOption, IonLabel, IonTitle, QrCodeModule,IonButton, IonButtons, IonBackButton, IonToolbar, IonItem, IonSelect, IonSelectOption, CommonModule]
})
export default class HouseholdDetailPage {
    private authService = inject(AuthService);
    private householdService = inject(HouseholdService);
    private householdMembersService = inject(HouseholdMembersService);
    private route = inject(ActivatedRoute)
    private router = inject(Router);

    selectedHousehold$ = combineLatest([
        this.route.params,
        toObservable(this.householdService.households),
        toObservable(this.householdMembersService.householdMembers)
    ]).pipe(map(([params, households, members]) => {
        if (params['id'] === undefined) return;
        const household = households.find(household => household.household_id === +params['id']);
        if (household === undefined) return;
        const householdMembers: any[] = members.filter(join => join.household_id === +params['id']).map((member: any) => ({household_id: member.household_id, user_id: member.user_id, ...member.tb_profiles}))
        // household member avatar_img is not working, it should be pulling information from google, but the request gets blocked due to "too many request"
        return {
            ...household,
            members: householdMembers
        }
    }));

    qrCode$ = combineLatest([
        this.selectedHousehold$,
        toObservable(this.authService.currentUser)
    ]).pipe(map(([selected, user]) => {
        if (user === undefined || user === null || selected === undefined) return undefined;
        const baseUrl = environment.production ? 'https://taskiago-67c53.web.app/home/settings/household' : `http://localhost:8100/home/settings/household`;
        const cipherText = encodeURIComponent(CryptoJS.AES.encrypt(`${user.id}<(•'.'•)>${selected.household_id}`, environment.cipher).toString());
        console.log(`${baseUrl}?join=${cipherText}`)
        return `${baseUrl}?join=${cipherText}`
    }));

    removeMember(member: any, household: TbHouseholds) {
        this.householdMembersService.delete$.next({householdId: household.household_id, userId: member.user_id})
        if (member.user_id === this.authService.currentUser()?.id) {
            this.router.navigate(['/home/settings/household'])
        }
    }
}
