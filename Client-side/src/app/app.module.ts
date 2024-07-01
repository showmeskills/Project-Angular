import { DragDropModule } from '@angular/cdk/drag-drop';
import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, ErrorHandler, Injectable, NgModule, isDevMode } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule, HAMMER_GESTURE_CONFIG, HammerGestureConfig, HammerModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy, Router } from '@angular/router';
import * as Sentry from '@sentry/angular-ivy';
import * as Hammer from 'hammerjs';
import { QrCodeModule } from 'ng-qrcode';
import { ClickOutsideModule } from 'src/app/shared/directive/click-outside/click-outside.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppDownloadTipsComponent } from './layouts/app-download-tips/app-download-tips.component';
import { BannerComponent } from './layouts/banner/banner.component';
import { BasicLayoutComponent } from './layouts/basic-layout/basic-layout.component';
import { BottomMenuComponent } from './layouts/bottom-menu/bottom-menu.component';
import { CurrencyWalletComponent } from './layouts/currency-wallet/currency-wallet.component';
import { FooterModule } from './layouts/footer/footer.module';
import { H5TopMenuComponent } from './layouts/h5-top-menu/h5-top-menu.component';
import { HeaderComponent } from './layouts/header/header.component';
import { LeftMenuComponent } from './layouts/left-menu/left-menu.component';
import { StatisticsPanelComponent } from './layouts/statistics-panel/statistics-panel.component';
import { TopBarComponent } from './layouts/top-bar/top-bar.component';
import { UserLayoutComponent } from './layouts/user-layout/user-layout.component';
import { LeftMenuActivityBarComponent } from './pages/activity/left-menu-activity-bar/left-menu-activity-bar.component';
import { PageNotFoundModule } from './pages/page-not-found/page-not-found.module';
import { WalletTransferComponent } from './pages/user-asset/wallet-transfer/wallet-transfer.component';
import { AuthPromptComponent } from './shared/components/auth-prompt/auth-prompt.component';
import { BindPopupComponent } from './shared/components/bind-popup/bind-popup.component';
import { BindVerifyPopupComponent } from './shared/components/bind-verify-popup/bind-verify-popup.component';
import { CodeInputModule } from './shared/components/code-input/code-input.module';
import { CustomizeFormModule } from './shared/components/customize-form/customize-form.module';
import { DatepickerModule } from './shared/components/datepicker/datepicker.module';
import { EddPopupComponent } from './shared/components/edd-popup/edd-popup.component';
import { EmptyModule } from './shared/components/empty/empty.module';
import { FaceVerifyComponent } from './shared/components/face-verify/face-verify.component';
import { LogoModule } from './shared/components/logo/logo.module';
import { PhoneNumberSelecterComponent } from './shared/components/phone-number-selecter/phone-number-selecter.component';
import { PreviewMediaComponent } from './shared/components/preview-media/preview-media.component';
import { ScrollbarModule } from './shared/components/scrollbar/scrollbar.module';
import { SelectCurrencyModule } from './shared/components/select-currency/select-currency.module';
import { ThemeSwitchComponent } from './shared/components/theme-switch/theme-switch.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { IntersectionObserverModule } from './shared/directive/intersection-observer/intersection-observer.module';
import { LoadingModule } from './shared/directive/loading/loading.module';
import { MouseScrollModule } from './shared/directive/mouse-scroll/mouse-scroll.module';
import './shared/extensions/number-extensions';

import { APP_BASE_HREF } from '@angular/common';
import { ServiceWorkerModule } from '@angular/service-worker';
import { FingerprintJSPro, FingerprintjsProAngularModule } from '@fingerprintjs/fingerprintjs-pro-angular';
import { environment } from 'src/environments/environment';
import { CustomReuseStrategy } from './custom-reuse-strategy';
import { HeaderLevel2MenuComponent } from './layouts/header-level2-menu/header-level2-menu.component';
import { ChatModule } from './pages/chat/chat.module';
import { CustomerServiceModule } from './shared/components/customer-service/customer-service.module';
import { StandardPopupModule } from './shared/components/standard-popup/standard-popup.module';
import { LifeObserveModule } from './shared/directive/life-observe/life-observe.module';
import { AvatarDefaultPipe } from './shared/pipes/avatar-default.pipe';
import { CountryFilterPipe } from './shared/pipes/cuontry-filter.pipe';
import { CurrencyValuePipe } from './shared/pipes/currency-value.pipe';
import { PipesModule } from './shared/pipes/pipes.module';
@Injectable()
class HammerConfig extends HammerGestureConfig {
  overrides = {
    pan: {},
    swipe: {
      direction: Hammer.DIRECTION_ALL,
    },
    press: { time: 1000 },
  };
}

@NgModule({
  declarations: [
    AppComponent,
    PhoneNumberSelecterComponent,
    BasicLayoutComponent,
    UserLayoutComponent,
    HeaderComponent,
    AuthPromptComponent,
    TopBarComponent,
    CurrencyWalletComponent,
    LeftMenuActivityBarComponent,
    LeftMenuComponent,
    BottomMenuComponent,
    H5TopMenuComponent,
    ThemeSwitchComponent,
    AppDownloadTipsComponent,
    BannerComponent,
    // RiskTasksComponent,
    ToastComponent,
    WalletTransferComponent,
    PreviewMediaComponent,
    StatisticsPanelComponent,
    BindPopupComponent,
    BindVerifyPopupComponent,
    FaceVerifyComponent,
    EddPopupComponent,
    HeaderLevel2MenuComponent,
  ],
  imports: [
    CustomerServiceModule,
    LifeObserveModule,
    PageNotFoundModule,
    StandardPopupModule,
    CustomizeFormModule,
    LogoModule,
    OverlayModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    HammerModule,
    FormsModule,
    ChatModule,
    QrCodeModule,
    MatDialogModule,
    MatCheckboxModule,
    CodeInputModule,
    MatSidenavModule,
    MatSlideToggleModule,
    PipesModule,
    MatToolbarModule,
    IntersectionObserverModule,
    ClickOutsideModule,
    ScrollbarModule,
    LoadingModule,
    EmptyModule,
    DragDropModule,
    MatBadgeModule,
    FooterModule,
    DatepickerModule,
    MouseScrollModule,
    SelectCurrencyModule,
    MatRadioModule,
    FingerprintjsProAngularModule.forRoot({
      loadOptions: {
        apiKey: environment.common.fpApiKey,
        scriptUrlPattern: [
          `${environment.common.fpEndpoint}/v<version>/<apiKey>/loader_v<loaderVersion>.js`,
          FingerprintJSPro.defaultScriptUrlPattern,
        ],
      },
    }),
    ServiceWorkerModule.register(`${window.location.origin}/ngsw-worker.js`, {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
  providers: [
    { provide: APP_BASE_HREF, useValue: window.location.origin },
    CountryFilterPipe,
    CurrencyValuePipe,
    AvatarDefaultPipe,
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: HammerConfig,
    },
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler({
        showDialog: false,
      }),
    },
    {
      provide: Sentry.TraceService,
      deps: [Router],
    },
    {
      provide: APP_INITIALIZER,
      useFactory: () => () => {},
      deps: [Sentry.TraceService],
      multi: true,
    },
    {
      provide: RouteReuseStrategy,
      useClass: CustomReuseStrategy,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
