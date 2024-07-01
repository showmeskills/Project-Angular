import { Injectable, NgZone } from '@angular/core';
import { Language } from 'src/app/shared/interfaces/zone';
import { ZoneApi } from 'src/app/shared/api/zone.api';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LangTabService {
  constructor(private zoneApi: ZoneApi, private zone: NgZone) {
    this.init();
  }

  list: Language[] = [{ code: 'zh-cn', name: '中文', disabled: true }];

  private _change = new Subject<void>();

  get change$() {
    return this._change.asObservable();
  }

  /** methods */
  init() {
    if (!(this.list || this.list['length'] <= 1)) return;

    this.zoneApi.getLanguages().subscribe((lang) => {
      if (!lang.length || !Array.isArray(lang)) return;

      lang?.forEach((e) => e.code === 'zh-cn' && (e.disabled = true)); // 固定中文禁止操作
      lang.find((e) => e.code === 'zh-cn') &&
        lang.unshift(
          lang.splice(
            lang.findIndex((e) => e.code === 'zh-cn'),
            1
          )[0]
        ); // 置顶中文
      this.list = lang;

      this._change.next();
    });
  }
}
