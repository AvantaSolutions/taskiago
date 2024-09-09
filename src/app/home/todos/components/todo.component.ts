import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonItem,  IonIcon, IonLabel } from '@ionic/angular/standalone'
import { addIcons } from 'ionicons';
import { checkboxOutline, squareOutline } from 'ionicons/icons';
import { TodosService } from 'src/app/shared/_data-access/todos.service';
import { TbItems } from 'src/app/shared/types/database';

@Component({
    selector: 'app-todo',
    template: `
        <ion-item class="relative border rounded-lg no-padding shadow-sm" style="{{todo.completed === null ? '' : '--background: rgb(243,243,243)'}}">
            <span class="absolute left-0 h-full w-6 rounded-l-lg" [style.background-color]="todo.color" [style.filter]="todo.completed === null ? '' : 'grayscale(0.5)'"></span>
            <span class="w-8"></span> 
            <ion-icon [name]="todo.completed === null ? 'square-outline' : 'checkbox-outline'" class="max-w-7 pr-2" (click)="markAsComplete(todo)"/> 
            <ion-label (click)="router.navigate(['/home/todos', todo.item_id])">
                <span [class.line-through]="todo.completed !== null">{{todo.label}}</span>
                @if(todo.completed !== null) {
                    <br>
                    <span class="text-xs text-gray-500">Completed: {{todo.completed | date: 'short'}}</span>
                }
            </ion-label>
            @if(todo.frequency !== 0) {
                @if(todo.repeats === 0) {
                    <svg viewBox="0 0 36 46" xmlns="http://www.w3.org/2000/svg" class="w-8">
                    <path d="M 13.11 9.11 C 15.896 8.069 18.944 7.985 21.78 8.87 C 23.742 9.484 25.529 10.539 27.015 11.941 L 28.437 10.501 C 29.502 9.421 31.323 10.184 31.323 11.712 L 31.323 18.541 L 24.578 18.541 C 23.073 18.541 22.316 16.696 23.381 15.617 L 24.621 14.364 C 23.523 13.353 22.215 12.593 20.782 12.147 C 18.654 11.483 16.369 11.543 14.28 12.323 C 12.192 13.103 10.414 14.557 9.219 16.464 C 8.027 18.366 7.486 20.615 7.677 22.862 C 7.874 25.106 8.79 27.227 10.29 28.891 C 11.792 30.56 13.791 31.679 15.982 32.083 C 18.174 32.484 20.435 32.144 22.415 31.118 C 24.396 30.09 25.99 28.431 26.951 26.397 C 27.352 25.543 28.362 25.181 29.205 25.588 C 30.048 25.995 30.405 27.019 30.003 27.873 C 28.724 30.584 26.6 32.795 23.957 34.168 C 21.315 35.538 18.299 35.99 15.379 35.453 C 12.457 34.918 9.791 33.422 7.791 31.2 C 5.792 28.981 4.566 26.154 4.309 23.159 C 4.052 20.162 4.773 17.165 6.365 14.625 C 7.955 12.086 10.324 10.15 13.11 9.11 Z" />
                    </svg>  
                } @else {
                    <svg viewBox="0 0 36 46" xmlns="http://www.w3.org/2000/svg" class="w-8">
                        @if(todo.repeats >= 200) {
                            <path fill="#F4900C" d="M35 19a16.96 16.96 0 0 0-1.04-5.868c-.46 5.389-3.333 8.157-6.335 6.868c-2.812-1.208-.917-5.917-.777-8.164c.236-3.809-.012-8.169-6.931-11.794c2.875 5.5.333 8.917-2.333 9.125c-2.958.231-5.667-2.542-4.667-7.042c-3.238 2.386-3.332 6.402-2.333 9c1.042 2.708-.042 4.958-2.583 5.208c-2.84.28-4.418-3.041-2.963-8.333A16.936 16.936 0 0 0 1 19c0 9.389 7.611 17 17 17s17-7.611 17-17z" transform="matrix(1, 0, 0, 1, -1.4210854715202004e-14, -2.842170943040401e-14)"/>
                            <path fill="#FFCC4D" d="M28.394 23.999c.148 3.084-2.561 4.293-4.019 3.709c-2.106-.843-1.541-2.291-2.083-5.291s-2.625-5.083-5.708-6c2.25 6.333-1.247 8.667-3.08 9.084c-1.872.426-3.753-.001-3.968-4.007A11.964 11.964 0 0 0 6 30c0 .368.023.73.055 1.09C9.125 34.124 13.342 36 18 36s8.875-1.876 11.945-4.91c.032-.36.055-.722.055-1.09c0-2.187-.584-4.236-1.606-6.001z" transform="matrix(1, 0, 0, 1, -1.4210854715202004e-14, -2.842170943040401e-14)"/>
                        }
                        <path d="M 13.11 9.11 C 15.896 8.069 18.944 7.985 21.78 8.87 C 23.742 9.484 25.529 10.539 27.015 11.941 L 28.437 10.501 C 29.502 9.421 31.323 10.184 31.323 11.712 L 31.323 18.541 L 24.578 18.541 C 23.073 18.541 22.316 16.696 23.381 15.617 L 24.621 14.364 C 23.523 13.353 22.215 12.593 20.782 12.147 C 18.654 11.483 16.369 11.543 14.28 12.323 C 12.192 13.103 10.414 14.557 9.219 16.464 C 8.027 18.366 7.486 20.615 7.677 22.862 C 7.874 25.106 8.79 27.227 10.29 28.891 C 11.792 30.56 13.791 31.679 15.982 32.083 C 18.174 32.484 20.435 32.144 22.415 31.118 C 24.396 30.09 25.99 28.431 26.951 26.397 C 27.352 25.543 28.362 25.181 29.205 25.588 C 30.048 25.995 30.405 27.019 30.003 27.873 C 28.724 30.584 26.6 32.795 23.957 34.168 C 21.315 35.538 18.299 35.99 15.379 35.453 C 12.457 34.918 9.791 33.422 7.791 31.2 C 5.792 28.981 4.566 26.154 4.309 23.159 C 4.052 20.162 4.773 17.165 6.365 14.625 C 7.955 12.086 10.324 10.15 13.11 9.11 Z" 
                        [style.fill]="todo.repeats >= 200 ? 'rgb(255, 0, 0)' : (todo.repeats >= 100 ? 'rgb(144, 38, 0)' :  (todo.repeats >= 10 ? 'rgb(91, 24, 0)' : 'black'))"/>
                        @switch(todo.repeats.toString().length) {
                            @case(1){
                                <text style="font-family: Arial, sans-serif; font-size: 18px; line-height: 34.3145px; stroke: rgb(0, 0, 0); text-anchor: middle; white-space: pre;" transform="matrix(0.785832941532135, 0, 0, 0.8243839144706726, 10.111978530883789, 2.003026008605957)" x="9" y="32.264">{{todo.repeats}}</text>
                            }
                            @case(2) {
                                <text style="font-family: Arial, sans-serif; font-size: 18px; line-height: 34.3145px; stroke: rgb(0, 0, 0); text-anchor: middle; white-space: pre;" transform="matrix(0.785832941532135, 0, 0, 0.8243839144706726, 10.111978530883789, 2.003026008605957)" x="7.5" y="32.264">{{todo.repeats}}</text>
                            }
                            @default {
                                <text style="font-family: Arial, sans-serif; font-size: 18px; line-height: 34.3145px; stroke: rgb(0, 0, 0); text-anchor: middle; white-space: pre;" transform="matrix(0.785832941532135, 0, 0, 0.8243839144706726, 10.111978530883789, 2.003026008605957)" x="10" y="32.264">{{todo.repeats}}</text>
                            }
                        }
                    </svg>
                }
            }
        </ion-item>
    `,
    styles: ``,
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, IonItem,  IonIcon, IonLabel],
})
export class TodoComponent {
    @Input({required: true}) todo: any;
    router = inject(Router);
    todosService = inject(TodosService);
     
    constructor() {
        addIcons({ squareOutline, checkboxOutline })
    }
    markAsComplete(todo: TbItems) {
        this.todosService.update$.next({id: todo.item_id, changes: {completed: new Date().toISOString()}})
    }
}
