import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonInput, IonLabel, IonInputPasswordToggle, IonCard, IonCardContent, IonCheckbox, IonButton } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/shared/_data-access/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-settings',
    template: `
    <!-- <ion-header [translucent]="true">
        <ion-toolbar color="primary">
            <ion-title>Login</ion-title>
        </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
        <ion-header collapse="condense">
            <ion-toolbar color="primary">
                <ion-title size="large">Login</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-card [formGroup]="loginForm">
            <ion-card-content>
                <form>
                    <ion-input type="text" label="Username" formControlName="username"></ion-input>

                    <ion-input type="password" label="Password" formControlName="password">
                        <ion-input-password-toggle slot="end"></ion-input-password-toggle>
                    </ion-input>

                    <ion-button [disabled]="form.invalid" (click)="signIn()">Login</ion-button>
                </form>
            </ion-card-content>
        </ion-card>
        
    </ion-content> -->
    <div class="bg-white min-h-full w-screen fixed  flex flex-row z-40" >
        <div class="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
            <div class="mx-auto w-full max-w-sm lg:w-96">
            <div>
                <img class="h-24 w-auto" src="assets/icon/logo.png" alt="Avanta Marketing's Taskiago">
                <h2 class="mt-6 text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
            </div>

            <div class="mt-8">
                <div class="mt-6">
                <div class="space-y-6" [formGroup]="loginForm">
                    <ion-label class="text-sm font-medium text-gray-700 " (click)="out(authService.currentUser())">Username {{authService.currentUser()}}</ion-label>
                    <ion-input type="text"  class="!mt-0 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" style="--color: black; --padding-start: 5px" formControlName="username"></ion-input>

                    <ion-label class="text-sm font-medium text-gray-700 ">Password</ion-label>
                    <ion-input type="password" class="!mt-0 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" style="--color: black; --padding-start: 5px" formControlName="password" (keyup)="$event.key === 'Enter' ? signIn() : ''">
                        <ion-input-password-toggle slot="end"></ion-input-password-toggle>
                    </ion-input>

                    @if(false) {
                        <div class="flex items-center justify-between">
                            <ion-checkbox labelPlacement="end" class="font-medium text-sm text-indigo-600">Remember me</ion-checkbox>

                            <div class="text-sm">
                                <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500"> Forgot your password? </a>
                            </div>
                        </div>
                    }

                    <div>
                        <ion-button [disabled]="loginForm.invalid" class="w-full" (click)="signIn()">Login</ion-button>
                        <button class="border border-gray-600 flex flex-row justify-center items-center w-full py-1 mt-1 rounded-md" style="border: 1px solid rgb(209 213 219 / var(--tw-border-opacity))" (click)="signInWGoogle()">
                            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 48 48" class="LgbsSe-Bz112c"><g><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></g></svg>
                            <span class="font-medium text-lg text-gray-600 ml-3">Sign in with Google</span>
                        </button>
                    </div>
                </div>
                </div>
            </div>
            </div>
        </div>
        <div class="hidden lg:block w-full flex-1">
            <img class="h-screen" src="assets/shapes.svg" alt="">
        </div>
    </div>
    `,
    styles: ``,
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonInput, IonLabel, IonCheckbox, IonInputPasswordToggle,IonCard, IonButton, IonCardContent, CommonModule, ReactiveFormsModule]
})
export default class LoginPage {
    authService = inject(AuthService);
    fb = inject(FormBuilder);
    
    
    loginForm = this.fb.nonNullable.group({
        username: ['', Validators.required],
        password: ['', Validators.required]
    })

    signIn() {
        const {username, password} = this.loginForm.getRawValue();
        this.authService.signInWithEmail(username, password)
        this.loginForm.reset();
    }

    signInWGoogle() {
        this.authService.signInWithGoogle();
    }

    out(item: any) { console.log(item) }
}