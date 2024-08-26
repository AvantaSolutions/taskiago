import { computed, inject, Injectable, NgZone, signal } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop'
import { createClient, SupabaseClient, User } from '@supabase/supabase-js'
import { BehaviorSubject, defer, delay, distinctUntilChanged, filter, from } from 'rxjs';
import { environment } from '../../../environments/environment'
import { SupabaseService } from './supabase.service';
import { getPlatforms} from '@ionic/angular'

export type AuthUser = User | null | undefined;

export interface Profile {
    user_id: string;
    photo_url: string;
    email: string;
    first_name: string;
    last_name: string;
}

interface AuthState {
    user: AuthUser
}
@Injectable({
  providedIn: 'root',
})
export class AuthService {
    #supabaseService = inject(SupabaseService);
    private supabase = this.#supabaseService.client;
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    // states
    private state = signal<AuthState>({
        user: null
    })
    // selectors, currentUser should only be used in services, if used in components, refer to profile in usersService
    currentUser = computed(() => this.state().user)

    constructor() {
        // // Manually load user session once on page load
        this.supabase.auth.onAuthStateChange((event, session) => {
            if ((event == 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && this.state().user === null) {
                sessionStorage.setItem('isLoggedIn', 'true');
                this.state.update((state) => ({ ...state, user: session!.user }));
            } else if (event == 'SIGNED_OUT') {
                this.state.update((state) => ({ ...state, user: null }));
            }
        });

        toObservable(this.currentUser).pipe(distinctUntilChanged(),takeUntilDestroyed(), delay(300)).subscribe(user => {
            if (user === null) return
            this.router.navigate([this.route.snapshot.queryParams['returnUrl'] || 'home/todo'])
        });
    }

    login(email: string) {
        return from(
            defer(() => 
                this.supabase.auth.signInWithOtp({
                    email
                })
            )
        );
    }

    logout() {
        sessionStorage.removeItem('isLoggedIn');
        this.supabase.auth.signOut().then(() => {
            this.state.update((state) => ({ ...state, user: null }));
        })
    }

    createAccount(email: string) {
        this.supabase.auth.signUp
        return from(
            defer(() => 
                this.supabase.auth.signUp({ 
                    email, 
                    password: "admin" 
                })
            )
        );
    }
    signInWithEmail(email: string, password: string) {
        return this.supabase.auth.signInWithPassword({
            email,
            password
        })
    }

    signInWithGoogle() {
        return this.supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: environment.production ? 'https://taskiago-67c53.web.app/login' : `http://localhost:8100/login`,
            }
        })
    }
}