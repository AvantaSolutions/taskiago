import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Observable, combineLatest, map } from 'rxjs';
import { TagsService } from '../../../shared/_data-access/tags.service';
import { TodosService } from '../../../shared/_data-access/todos.service';
import { TodoDetailComponent } from './components/todo-detail.component';

@Component({
    selector: 'app-todo-details',
    template: `
    @if(selectedTodo$ | async; as selectedTodo) {
        <ion-header [translucent]="true">
            <ion-toolbar style="{{tagColor$ | async}}">
            
                <ion-buttons slot="start">
                    <ion-back-button defaultHref="/home/todos"></ion-back-button>
                </ion-buttons>
                <ion-title>{{selectedTodo.label}}</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content [fullscreen]="true">
            <ion-header collapse="condense">
                <ion-toolbar>
                    <ion-buttons slot="start">
                        <ion-back-button defaultHref="/home/todos"></ion-back-button>
                    </ion-buttons>
                    <ion-title size="large">{{selectedTodo.label}}</ion-title>
                </ion-toolbar>
            </ion-header>

            <app-todo-detail/>
        </ion-content>
    }   
  `,
  styles: ``,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, TodoDetailComponent]
})
export default class TodoDetailsPage {
    router = inject(Router)
    route = inject(ActivatedRoute);
    todosService = inject(TodosService);
    tagsService = inject(TagsService);

    selectedTodo$ = combineLatest([
        this.route.params,
        toObservable(this.todosService.todos)
    ]).pipe(map(([params, todos]) => todos.find(todo => todo.item_id === +params['id'])))

    tagColor$: Observable<string> = combineLatest([
        toObservable(this.tagsService.tags),
        this.selectedTodo$
    ]).pipe(map(([tags, selectedTodo]) => {
        const tag = tags.find(tag => tag.tag_id === selectedTodo?.tag_id)
        return tag === undefined ? '' : `--background: ${tag.color}; --color: ${tag.textColor}`
    }))
}
