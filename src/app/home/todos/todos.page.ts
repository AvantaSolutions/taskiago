import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent,IonFab, IonFabButton, IonHeader, IonIcon, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { SharedService } from 'src/app/shared/_data-access/shared.service';
import { todoComponent } from './components/todo-list.component';
import { TodoModalComponent } from './components/create-todo.component';


@Component({
    selector: 'app-todo',
    template: `
    <ion-header [translucent]="true">
        <ion-toolbar color="primary">
            <ion-title>Week of {{sharedService.startDate | date: 'shortDate'}}</ion-title>
        </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
        <ion-header collapse="condense">
            <ion-toolbar color="primary">
                <ion-title size="large">Week of {{sharedService.startDate | date: 'shortDate'}}</ion-title>
            </ion-toolbar>
        </ion-header>

        <app-todo-list/>
        <app-todo-modal/>
    </ion-content>

    <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button id="open-modal" expand="block">
            <ion-icon name="add"></ion-icon>
        </ion-fab-button>
    </ion-fab>
    `,
    styles: ``,
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonFab, IonIcon, IonFabButton, CommonModule, FormsModule, todoComponent, TodoModalComponent]
})
export default class todoPage {
    sharedService = inject(SharedService);
}
//adding drag and drop functionality would be awesome, would need to 