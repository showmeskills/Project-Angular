import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { BasicLayoutComponent } from './layouts/basic-layout/basic-layout.component';
import { LoginComponent } from './pages/login/login.component';
import { RedirectGuard } from 'src/app/auth/redirect.guard';
import { Component } from '@angular/core';

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
        loadChildren: () => import('src/app/pages/dashboard/dashboard-routing').then((m) => m.routes),
      },
      {
        path: 'game',
        loadChildren: () => import('./pages/game/game-routing').then((m) => m.routes),
      },
      {
        path: 'authority',
        loadChildren: () => import('src/app/pages/authority/authority-routing').then((m) => m.routes),
      },
      {
        path: 'system',
        loadChildren: () => import('./pages/system/system-routing').then((m) => m.routes),
      },
      {
        path: 'content',
        loadChildren: () => import('./pages/content/content-routing').then((m) => m.routes),
      },
      {
        path: 'session',
        loadChildren: () => import('./pages/session/session-routing').then((m) => m.routes),
      },
      {
        path: 'pay',
        loadChildren: () => import('./pages/pay/pay-routing').then((m) => m.routes),
      },
      {
        path: 'member',
        loadChildren: () => import('./pages/member/member-routing').then((m) => m.routes),
      },
      {
        path: 'finance',
        loadChildren: () => import('./pages/finance/finance-routing').then((m) => m.routes),
      },
      {
        path: 'vip',
        loadChildren: () => import('./pages/vip/vip-routing').then((m) => m.routes),
      },
      {
        path: 'OTP',
        loadChildren: () => import('./pages/OTP/OTP-routing').then((m) => m.routes),
      },
      {
        path: 'bonus',
        loadChildren: () => import('src/app/pages/Bonus/bonus-routing').then((m) => m.routes),
      },
      {
        path: 'proxy',
        loadChildren: () => import('./pages/proxy/proxy-routing').then((m) => m.routes),
      },
      {
        path: 'kyc',
        loadChildren: () => import('./pages/kyc/kyc-routing').then((m) => m.routes),
      },
      {
        path: 'risk',
        loadChildren: () => import('./pages/risk/risk-routing').then((m) => m.routes),
      },
      {
        path: 'lottery',
        loadChildren: () => import('./pages/lottery/lottery-routing').then((m) => m.routes),
      },
      {
        path: 'original',
        loadChildren: () => import('./pages/original/original-routing').then((m) => m.routes),
      },
      {
        path: 'sports',
        loadChildren: () => import('./pages/sports/sports-routing').then((m) => m.routes),
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
