import { Routes } from '@angular/router';
import { AuthGuard } from './shared/utils/guard.component';

export const routes: Routes = [
  {
    path: 'home',
    canActivate: [AuthGuard],
    loadComponent: () => import('./home/home.page'),
    children: [
        {
            path: '',
            redirectTo: 'todo',
            pathMatch: 'full'
        },
        {
            path: 'todo',
            loadComponent: () => import('./home/todos/todos.page')
          },
          {
            path: 'settings',
            loadComponent: () => import('./home/settings/settings.page')
          },
          {
            path: 'tags',
            loadComponent: () => import('./home/tags/tags.page')
          },
    ]
  },
  {
    path: 'todo-detail/:id',
    loadComponent: () => import('./home/todos/todo-details/todo-details.page')
  },
  {
    path: 'tag-detail/:id',
    loadComponent: () => import('./home/tags/tag-details/tag-details.page')
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page')
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
