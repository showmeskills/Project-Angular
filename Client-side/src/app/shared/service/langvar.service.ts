import { Injectable } from '@angular/core';
import { AppService } from 'src/app/app.service';

@Injectable({
  providedIn: 'root',
})
export class LangvarService {
  constructor(private appService: AppService) {}

  // https://support.zendesk.com/api/v2/locales/public.json
  get zELang() {
    return (
      {
        'zh-cn': 'zh-cn',
        'en-us': 'en-US',
        th: 'th',
        vi: 'vi',
        tr: 'tr',
        'pt-br': 'pt-br',
        ja: 'ja',
      }[this.appService.languageCode] ?? this.zELangDefault
    );
  }
  get zELangDefault() {
    return 'en-US';
  }
}
