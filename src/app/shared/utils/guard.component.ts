import { Injectable, inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivate, ActivatedRoute } from '@angular/router';
import { Observable, filter, map, of, take } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
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