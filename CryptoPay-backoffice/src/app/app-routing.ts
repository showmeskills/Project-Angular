import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { BasicLayoutComponent } from './layouts/basic-layout/basic-layout.component';
import { LoginComponent } from './pages/login/login.component';
import { RedirectGuard } from 'src/app/auth/redirect.guard';

@Component({
  template: '<div>Not Found 404</div>',
  standalone: true,
})
class NotFoundComponent {}

const routes: Routes = [
  //登录页面
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: BasicLayoutComponent,
    canActivateChild: [AuthGuard, RedirectGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full', canActivateChild: [RedirectGuard] },
      {
        path: 'dashboard',
        loadChildren: () => import('./pages/dashboard/dashboard-routing').then((m) => m.routes),
      },
      {
        path: 'authority',
        loadChildren: () => import('./pages/authority/authority-routing').then((m) => m.routes),
      },
      {
        path: 'system',
        loadChildren: () => import('./pages/system/system-routing').then((m) => m.routes),
      },
      {
        path: 'pay',
        loadChildren: () => import('./pages/pay/pay-routing').then((m) => m.routes),
      },
      {
        path: 'money',
        loadChildren: () => import('./pages/money/money-routing').then((m) => m.routes),
      },
      {
        path: 'proxy',
        loadChildren: () => import('./pages/proxy/proxy-routing').then((m) => m.routes),
      },
      {
        path: 'risk',
        loadChildren: () => import('./pages/risk/risk-routing').then((m) => m.routes),
      },
      {
        path: 'wallet',
        loadChildren: () => import('./pages/wallet/wallet-routing').then((m) => m.routes),
      },
      { path: '**', component: NotFoundComponent },
    ],
  },
];

/**
 * 路由配置
 * @usageNotes
 * > 这里得路由统统不要加语系或斜杠，否则会导致路由匹配不到，语系由路由守卫自动匹配
 * @Annotation
 */
export const rootRoute: Routes = [
  {
    path: '',
    component: NotFoundComponent,
    children: routes,
    canActivateChild: [RedirectGuard],
    canActivate: [RedirectGuard],
    pathMatch: 'full',
  },
  { path: ':lang', children: routes, canActivateChild: [RedirectGuard], canActivate: [RedirectGuard] },
];
