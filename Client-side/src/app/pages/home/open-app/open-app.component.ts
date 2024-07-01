import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-open-app',
  templateUrl: './open-app.component.html',
  styleUrls: ['./open-app.component.scss'],
})
export class OpenAppComponent implements OnInit {
  constructor(public appService: AppService) {}

  url: string = '';

  ngOnInit() {
    const isIOS = /(iphone|ipad|ipod|ios|Mac OS X)/i.test(navigator.userAgent);
    this.url = isIOS
      ? this.appService.tenantConfig.config.appIosWakelink || ''
      : this.appService.tenantConfig.config.appAndroidWakelink || '';
  }

  onLink() {
    window.location.href = this.url;
    let isAppOpened = false;
    const listener = () => {
      isAppOpened = true;
    };
    window.addEventListener('blur', listener);
    setTimeout(() => {
      if (!isAppOpened) {
        window.location.href = this.appService.getAppUrl();
      }
      window.removeEventListener('blur', listener);
    }, 1 * 1000);
  }
}
