import { registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';
import { destroyPlatform, enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { AccountInforData } from './app/shared/interfaces/account.interface';
import { LOCAL_USER_INFO, LocalKeyPrefix } from './app/shared/service/localstorage.service';
import { sentryInit } from './app/shared/service/sentry.service';
import { environment } from './environments/environment';

registerLocaleData(zh);

if (environment.production) {
  enableProdMode();
  if (environment.isOnline) {
    window.console.log = () => {};
    window.console.info = () => {};
    window.console.warn = () => {};
    window.console.debug = () => {};
    // window.console.error = () => {};
  }
}

(window.setHotjarUser = () => {
  if ('hj' in window && typeof window.hj === 'function') {
    const userString = window.localStorage.getItem(LocalKeyPrefix + LOCAL_USER_INFO) || 'null';
    const user: AccountInforData | null = JSON.parse(userString);
    const uid = user?.uid ?? null;
    const appversion = environment.version;
    const tpid = 'm1';
    const env = environment.isOnline ? 'prod' : environment.isUat ? 'uat' : 'sit';
    window.hj('identify', uid, { tpid, appversion, env });
  }
})();

sentryInit();

(build => {
  if (window.isSupportWebp) document.body.classList.add('is-support-webp');
  window.eventBank = [];
  window.reBuild = () => {
    //显示全局 global-waiting
    const el: HTMLDivElement | null = document.querySelector('.global-waiting');
    if (el) el.style.display = 'flex';
    //销毁重建
    destroyPlatform();
    //清理无用dom
    document.querySelectorAll('.botion_captcha.botion_bind').forEach(x => x.remove());
    const rootElement = document.querySelector('app-root');
    if (!rootElement) {
      const wrap: HTMLDivElement | null = document.querySelector('#root_con_wrap');
      const root = document.createElement('app-root');
      wrap && wrap.appendChild(root);
    }
    build();
  };
  build();
})(() => platformBrowserDynamic().bootstrapModule(AppModule).catch());
