import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonItem, IonButtons, IonButton, IonInput, IonList, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { NgxColorsModule } from 'ngx-colors';
import { ReplaySubject, combineLatest, debounceTime, distinctUntilChanged, map, takeUntil, tap } from 'rxjs';
import { TagsService } from 'src/app/shared/_data-access/tags.service';
import { TbItems, TbTags } from 'src/app/shared/types/database';

@Component({
    selector: 'app-tag-detail',
    template: `
    @if(selectedTag$ | async; as selectedTag) {
        <ion-list [formGroup]="form">
            <ion-item>
                <ion-input type="text" formControlName="name" label="Enter the tag name" labelPlacement="floating"/>
            </ion-item>
            <ion-item class="relative">
                <ion-input type="text" [value]="selectedTag.color" label="Enter the tag color" labelPlacement="floating" disabled style="opacity: 1"/>
                <ngx-colors
                #ngxColor
                ngx-colors-trigger
                [hideTextInput]="true"
                [hideColorPicker]="false"
                colorPickerControls="no-alpha"
                formControlName="color"/>
            </ion-item>
            <ion-item>Created on {{selectedTag.created_at | date: 'shortDate'}}</ion-item>
        </ion-list>
       
      
        <ion-buttons>
            <ion-button color="danger" (click)="deleteTodo(selectedTag)">Delete</ion-button>
        </ion-buttons>
    }
    `,
    styles: ``,
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        IonItem, IonButtons, IonButton, IonInput, IonList, IonSelect, IonSelectOption,
        CommonModule, ReactiveFormsModule, NgxColorsModule
    ],
})
export class TagDetailComponent implements OnDestroy {
    private fb = inject(FormBuilder)
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    tagsService = inject(TagsService);
    color ='#fff';
    textColor: 'black'|'white' = 'black';
    destroy$ = new ReplaySubject<boolean>(1);

    form = this.fb.nonNullable.group({
        name: ['', Validators.required],
        color: ['', Validators.required]
    })

    selectedTag$ = combineLatest([
        this.route.params,
        toObservable(this.tagsService.tags)
    ]).pipe(
        map(([params, tags]) => tags.find(tag => tag.tag_id === +params['id'])),
        tap(selectedTag => {
            if (selectedTag === undefined) return;
            this.form.patchValue({
                name: selectedTag.name,
                color: selectedTag.color
            }, {emitEvent: false})

            this.form.get('name')?.valueChanges.pipe(debounceTime(1000), distinctUntilChanged(), takeUntil(this.destroy$)).subscribe(name => {
                this.tagsService.update$.next({id: selectedTag.tag_id, changes: {name} })
            })
            this.form.get('color')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(color => {
                this.textColor = this.tagsService.hexToRgb(color);
                this.tagsService.update$.next({id: selectedTag.tag_id, changes: {color} })
            })
        })
    )

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    deleteTodo(selectedTodo: TbTags) {
        this.tagsService.delete$.next(selectedTodo.tag_id);
        this.router.navigate(['/home'])
    }
}
