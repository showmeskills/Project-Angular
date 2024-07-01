import { Injectable } from '@angular/core';
import { firstValueFrom, Observable, of, Subject } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { AuthApi } from '../apis/auth.api';
import { VerifyData } from '../interfaces/auth.interface';
import { LocaleService } from './locale.service';

/** Geetest多语言对应参数 https://docs.geetest.com/gt4/apirefer/api/web#product */
const LANG_MAP: Record<string, string> = {
  'en-us': 'eng',
  'zh-cn': 'zho',
  th: 'eng',
  vi: 'eng',
  tr: 'eng',
  'pt-br': 'eng',
  ja: 'jpn',
};

@Injectable({
  providedIn: 'root',
})
export class GeetestService {
  constructor(
    private authApi: AuthApi,
    private appService: AppService,
    private localeService: LocaleService,
  ) {}

  /**
   * 请求Geetest验证
   *
   * @returns
   */
  async verify(): Promise<Observable<VerifyData | null>> {
    //初始化数据
    if (this.appService.tenantConfig?.config?.ignoreGt === '1') {
      return of({
        lot_number: '',
        captcha_output: '',
        pass_token: '',
        gen_time: '',
      });
    } else {
      const captchaId = await firstValueFrom(this.authApi.getCaptchaId());
      if (captchaId) {
        const subject = new Subject<VerifyData | null>();
        //@ts-ignore
        initBotion(
          {
            captchaId: captchaId,
            product: 'bind',
            riskType: 'slide',
            hideSuccess: 'true',
            language: LANG_MAP[this.appService.languageCode] || 'eng',
            onError: (e: { desc: string; msg: string; code: string }) => {
              // if (e.code === '60204') {
              //   this.appService.showForbidTip(
              //     'income',
              //     this.localeService.getValue('net_con_fail_desc'),
              //     this.localeService.getValue('net_con_fail_t')
              //   );
              // }
              subject.next({
                lot_number: '',
                captcha_output: '',
                pass_token: '',
                gen_time: '',
              });
              subject.complete();
            },
          },
          (captchaObj: any) => {
            captchaObj
              .onReady((_: any) => {
                //检测验证码是否ready
                captchaObj.showCaptcha();
              })
              .onSuccess((_: any) => {
                //如果验证成功 Geetest返回新数据
                const geeTestResult: VerifyData = captchaObj.getValidate();
                subject.next(geeTestResult);
                subject.complete();
              })
              .onError((_: any) => {
                subject.next({
                  lot_number: '',
                  captcha_output: '',
                  pass_token: '',
                  gen_time: '',
                });
                subject.complete();
              })
              .onClose((_: any) => {
                subject.next(null);
                subject.complete();
              });
          },
        );
        return subject;
      } else {
        return of({
          lot_number: '',
          captcha_output: '',
          pass_token: '',
          gen_time: '',
        });
      }
    }
  }
}
