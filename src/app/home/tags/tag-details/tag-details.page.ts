import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Observable, combineLatest, map } from 'rxjs';
import { TagsService } from '../../../shared/_data-access/tags.service';
import { TodosService } from '../../../shared/_data-access/todos.service';
import { TagDetailComponent } from './components/tag-detail.component';

@Component({
    selector: 'app-tag-details',
    template: `
    @if(selectedTag$ | async; as selectedTag) {
        <ion-header [translucent]="true">
            <ion-toolbar style="--background: {{selectedTag.color}}; --color: {{selectedTag.textColor}}">
            
                <ion-buttons slot="start">
                    <ion-back-button defaultHref="/home"></ion-back-button>
                </ion-buttons>
                <ion-title>{{selectedTag.name}}</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content [fullscreen]="true">
            <ion-header collapse="condense">
                <ion-toolbar>
                    <ion-buttons slot="start">
                        <ion-back-button defaultHref="/home"></ion-back-button>
                    </ion-buttons>
                    <ion-title size="large">{{selectedTag.name}}</ion-title>
                </ion-toolbar>
            </ion-header>

            <app-tag-detail/>
        </ion-content>
    }   
  `,
  styles: ``,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, TagDetailComponent]
})
export default class TagDetailsPage {
    router = inject(Router)
    route = inject(ActivatedRoute);
    tagsService = inject(TagsService);

    selectedTag$ = combineLatest([
        this.route.params,
        toObservable(this.tagsService.tags)
    ]).pipe(map(([params, tags]) => tags.find(tag => tag.tag_id === +params['id'])))

}
