import { enableProdMode, ErrorHandler, importProvidersFrom } from '@angular/core';

import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { ConfirmModalModule } from 'src/app/shared/components/dialogs/confirm-modal/confirm-modal.module';
import { LangModule } from 'src/app/shared/components/lang/lang.module';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormRowModule } from 'src/app/shared/components/form-row/form-row.module';
import { MatModalModule } from 'src/app/shared/components/dialogs/modal';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'src/app/components/datetime-picker';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatDialogModule } from '@angular/material/dialog';
import { SubheaderModule } from './app/_metronic/partials/layout/subheader/subheader.module';
import { NgbModule, NgbToastModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { rootRoute } from 'src/app/app-routing';
import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import { CustomRouteReuseStrategy } from './app/shared/route-reuse/strategy';
import { provideRouter, RouteReuseStrategy } from '@angular/router';
import * as Sentry from '@sentry/angular-ivy';

if (environment.production) {
  enableProdMode();
}

Sentry.init({
  // Tracing
  integrations: [
    new Sentry.BrowserTracing({
      routingInstrumentation: Sentry.routingInstrumentation,
    }),
  ],
  dsn: environment.sentryDSN,
  tracesSampleRate: 1.0, // 性能监控事务采样率
  tracePropagationTargets: environment.isOnline ? [window.origin] : ['localhost', environment.apiUrl],
  release: environment.version, // 版本号
  sendDefaultPii: true, // 是否带用户信息
  environment: environment.env,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(rootRoute),
    importProvidersFrom(
      BrowserModule,
      FormsModule,
      ReactiveFormsModule,
      NgbModule,
      SubheaderModule,
      NgbToastModule,
      MatDialogModule,
      DragDropModule,
      NgbTooltipModule,
      OwlDateTimeModule,
      OwlNativeDateTimeModule,
      MatModalModule,
      FormRowModule,
      AngularSvgIconModule.forRoot(),
      MatButtonModule,
      MatMenuModule,
      LangModule.forRoot('common'),
      ConfirmModalModule
    ),
    // 路由复用策略（页面缓存）
    {
      provide: RouteReuseStrategy,
      useClass: CustomRouteReuseStrategy,
    },
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler({
        showDialog: false,
        extractor: (error: unknown, defaultExtractor: (error: unknown) => unknown) => {
          return defaultExtractor(error);
        },
      }),
    },
  ],
}).catch((err) => console.error(err));
