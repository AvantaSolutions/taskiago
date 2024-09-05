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
            path: 'todos',
            children: [
                {
                    path: '',
                    loadComponent: () => import('./home/todos/todos.page')
                },
                {
                    path: ':id',
                    loadComponent: () => import('./home/todos/todo-details/todo-details.page')
                }
            ]
          },
          {
            path: 'settings',
            children: [
                {
                    path: '',
                    loadComponent: () => import('./home/settings/settings.page'),
                },
                {
                    path: 'household',
                    children: [
                        {
                            path: '',
                            loadComponent: () => import('./home/settings/households/household.page'),
                        },
                        {
                            path: ':id',
                            loadComponent: () => import('./home/settings/households/components/household-detail.page'),
                        }
                    ]
                }
            ]
          },
          {
            path: 'tags',
            children: [
                {
                    path: '',
                    loadComponent: () => import('./home/tags/tags.page')
                },
                {
                    path: ':id',
                    loadComponent: () => import('./home/tags/tag-details/tag-details.page')
                }
            ]
          },
    ]
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
