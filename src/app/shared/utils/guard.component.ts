import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../_data-access/auth.service';


@Injectable({
    providedIn: 'root',
  })
export class AuthGuard implements CanActivate {
    constructor(
      private auth: AuthService,
      private router: Router,
    ) {}
  
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
      return !this.auth.currentUser() ? this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }}) : !!this.auth.currentUser()
    }
}