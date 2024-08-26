import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IonButton, IonCheckbox, IonCol, IonGrid, IonIcon, IonItem, IonLabel, IonList, IonRow, ModalController } from '@ionic/angular/standalone';
import { TodosService } from '../../../shared/_data-access/todos.service';
import { TagsService } from '../../../shared/_data-access/tags.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TbItems, TbTags } from 'src/app/shared/types/database';
import { SharedService } from 'src/app/shared/_data-access/shared.service';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { squareOutline } from 'ionicons/icons';

interface Todo {
    tag: string,
    label: string,
    value: boolean
}

@Component({
    selector: 'app-tag-list',
    template: `
    <ion-grid>
        @for(tag of tagsService.tags(); track $index) {
            <ion-row>
                <ion-col>
                    <ion-item class="relative border rounded-lg no-padding">
                        <span class="absolute left-0 h-full w-6 rounded-l-lg" [style.background-color]="tag.color"></span>
                        <ion-label (click)="router.navigate(['/tag-detail', tag.tag_id])" class="pl-8 ">{{tag.name}}</ion-label>
                    </ion-item>
                </ion-col>
            </ion-row>
        }
    </ion-grid>
    
    `,
    styles: `
    
    .no-padding {
        --padding-start: 0px !important;
    }`,
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, IonCheckbox, IonCol, IonGrid, IonItem, IonLabel, IonList, IonRow, IonButton, IonIcon],
})
export class TagListComponent {
    router = inject(Router);
    sharedService = inject(SharedService);
    todosService = inject(TodosService);
    tagsService = inject(TagsService);

    constructor() {
        addIcons({ squareOutline })
    }


}
