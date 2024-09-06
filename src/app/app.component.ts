import { Component, NgZone, inject } from '@angular/core';
import { Router } from '@angular/router';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { SupabaseService } from './shared/_data-access/supabase.service';
import { refresh } from 'ionicons/icons';
import { AuthService } from './shared/_data-access/auth.service';

@Component({
    selector: 'app-root',
    template: `
    <ion-app>
        <ion-router-outlet></ion-router-outlet>
    </ion-app>
    `,
    standalone: true,
    imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
    private supabaseService = inject(SupabaseService);
    private supabase = this.supabaseService.client;
    private authService = inject(AuthService);
    private router = inject(Router);
    constructor( private _ngZone: NgZone ) {
        App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
            this._ngZone.run(() => {
                const slug = event.url.split(".app").pop();

                if (slug) {
                    if (slug.includes('#access_token')) {
                        const urlParams = new URLSearchParams(slug.split('#')[1]);
                        const accessToken = urlParams.get('access_token');
                        const refreshToken = urlParams.get('refresh_token')
                        if (!!accessToken && !!refreshToken) {
                            this.supabase.auth.setSession({access_token: accessToken, refresh_token: refreshToken})
                            this.router.navigateByUrl('/login');
                        }
                    } else {
                        this.router.navigateByUrl(slug);
                    }
                }
                this.router.navigate(['/home'])
            });
        });

        App.addListener('appStateChange', (state) => {
            if (state.isActive) {
                if (this.authService.currentUser() === null && localStorage.getItem('sb-eflngwfofosewlawxvfn-auth-token') !== null) {
                    this.router.navigateByUrl('/home/todos')
                }
            }
        });
    }
}
