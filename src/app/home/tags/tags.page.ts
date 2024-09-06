import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonFab, IonFabButton, IonIcon, IonToolbar } from '@ionic/angular/standalone';
import { TagListComponent } from './components/tag-list.component';
import { TagModalComponent } from './components/create-tag.component';

@Component({
    selector: 'app-tags',
    template: `
    <ion-content [fullscreen]="true">
        <ion-header>
            <ion-toolbar color="primary">
                <ion-title>User Defined Tags</ion-title>
            </ion-toolbar>
        </ion-header>

        <app-tag-list/>
        <app-tag-modal/>
    </ion-content>

    <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button id="create-tag-modal" expand="block">
            <ion-icon name="add"></ion-icon>
        </ion-fab-button>
    </ion-fab>
    `,
    styles: ``,
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonFab, IonFabButton, IonIcon, CommonModule, TagListComponent, TagModalComponent, FormsModule]
})
export default class TagsPage {}
