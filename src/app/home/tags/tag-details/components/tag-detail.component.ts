import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonItem, IonButtons, IonButton, IonInput, IonList, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { NgxColorsModule } from 'ngx-colors';
import { ReplaySubject, Subject, combineLatest, debounceTime, distinctUntilChanged, map, takeUntil, tap } from 'rxjs';
import { AuthService } from 'src/app/shared/_data-access/auth.service';
import { HouseholdService } from 'src/app/shared/_data-access/household.service';
import { SupabaseService } from 'src/app/shared/_data-access/supabase.service';
import { TagsService } from 'src/app/shared/_data-access/tags.service';
import { TodosService } from 'src/app/shared/_data-access/todos.service';
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

            @if(selectedTag.created_by === authService.currentUser()?.id) {
                <ion-item>
                    <ion-select label="Share with Household?" interface="popover" formControlName="household" required multiple>
                        @for(household of householdService.households(); track $index) {
                            <ion-select-option [value]="household.household_id">{{household.name}}</ion-select-option>
                        }
                    </ion-select>
                </ion-item>
            }
        </ion-list>
       
      
        @if(selectedTag.created_by === authService.currentUser()?.id) {
            <ion-buttons>
                <ion-button color="danger" (click)="deleteTodo(selectedTag)">Delete</ion-button>
            </ion-buttons>
        }
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
    private supabaseService = inject(SupabaseService);

    tagsService = inject(TagsService);
    todosService = inject(TodosService);
    householdService = inject(HouseholdService);
    authService = inject(AuthService);
    color ='#fff';
    textColor: 'black'|'white' = 'black';
    destroy$ = new Subject<boolean>();

    form = this.fb.nonNullable.group({
        name: ['', Validators.required],
        color: ['', Validators.required],
        household: this.fb.control<number[]>([])
    })

    selectedTag$ = combineLatest([
        this.route.params,
        toObservable(this.tagsService.tags)
    ]).pipe(
        map(([params, tags]) => tags.find(tag => tag.tag_id === +params['id'])),
        tap(selectedTag => {
            this.destroy$.next(true);
            if (selectedTag === undefined) return;
            this.form.patchValue({
                name: selectedTag.name,
                color: selectedTag.color,
                household: selectedTag.households
            }, {emitEvent: false})

            this.form.get('name')?.valueChanges.pipe(debounceTime(1000), distinctUntilChanged(), takeUntil(this.destroy$)).subscribe(name => {
                this.tagsService.update$.next({id: selectedTag.tag_id, changes: {name} })
            })
            this.form.get('color')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(color => {
                this.textColor = this.tagsService.hexToRgb(color);
                this.tagsService.update$.next({id: selectedTag.tag_id, changes: {color} })
            })
            this.form.get('household')?.valueChanges.pipe(distinctUntilChanged(), takeUntil(this.destroy$)).subscribe(households => {
                const householdValue = !!households && households.length !== 0 ? households : null
                this.tagsService.update$.next({id: selectedTag.tag_id, changes: {households: householdValue} })
                //TODO: convert this to a triggered event that happends on update to tb_tags
                this.supabaseService.client.schema('public').from('tb_items').update({households: householdValue}).eq('tag_id', +selectedTag.tag_id).then(res => {
                    console.log('updating all todos with this tag')
                })
            })
        })
    )

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    deleteTodo(selectedTodo: TbTags) {
        this.tagsService.delete$.next(selectedTodo.tag_id);
        this.router.navigate(['/home/tags'])
    }
}
