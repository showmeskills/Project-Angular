import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import moment from 'moment';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { NotificationCenterApi } from 'src/app/shared/apis/notification-center.api';
import { RiskControlApi } from 'src/app/shared/apis/risk-control.api';
import { DeleteParams, QueryNoticeParams } from 'src/app/shared/interfaces/notification-center.interface';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  /**订阅是否已经全部删除 */
  isDeleteAll$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  /**订阅是否已经全部阅读 */
  isReadedAll$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  /**当top-bar 清除之后和推送事件发生的时候 主页面重新加载页面的数据*/
  reLoadData$: Subject<boolean> = new Subject<boolean>();
  constructor(
    private appService: AppService,
    private notificationApi: NotificationCenterApi,
    private localeService: LocaleService,
    // private riskService: RiskControlService,
    private riskApi: RiskControlApi,
    private router: Router,
    private localStorageService: LocalStorageService,
  ) {}

  // 获取站内信 所有信息
  getNoticeCounts() {
    this.notificationApi.getNoticeCount().subscribe(noticeCounts => {
      this.appService.noticeCounts$.next(noticeCounts);
    });
  }

  // 时间转换
  toTransferDate(timestamp: number) {
    if (typeof timestamp === 'string') return timestamp;
    const currentTime = Math.floor(new Date().getTime() / 1000);
    const secForHour = 60 * 60;
    const secForDay = 24 * secForHour;
    const diff = currentTime - Math.floor(timestamp / 1000);
    if (diff > secForDay) {
      return moment(timestamp).format('YYYY-MM-DD HH:mm:ss');
    } else if (diff > secForHour) {
      return `${moment.duration(diff, 'seconds').hours()} ${this.localeService.getValue('hour_ag00')}`;
    } else {
      return `1 ${this.localeService.getValue('hour_ag00')}`;
    }
  }

  getQueryNotice(params?: QueryNoticeParams): Observable<any> {
    return this.notificationApi.getQueryNotice(params).pipe(
      map(
        x =>
          x?.data || {
            list: [],
            total: 0,
          },
      ),
      map(x => ({
        list: x?.list?.map((item: any) => ({
          ...item,
          title: this.localeService.brandNameReplace(item?.title),
          content: this.localeService.brandNameReplace(item?.content),
          sendTime: this.toTransferDate(item?.sendTime),
        })),
        total: x.total,
      })),
    );
  }

  // 获取站内信邮件
  public getNoticeList(params?: { n: number }) {
    return this.notificationApi.getNoticeList(params).pipe(
      map(
        (x: any) =>
          x?.data?.map((item: any) => ({
            ...item,
            title: this.localeService.brandNameReplace(item?.title),
            content: this.localeService.brandNameReplace(item?.content),
            sendTime: this.toTransferDate(item?.sendTime),
          })) || {
            data: [],
          },
      ),
    );
  }

  //设置已经
  readNotice(params: DeleteParams): Observable<any> {
    return this.notificationApi.readNotice(params).pipe(
      map(
        (x: any) =>
          x?.data || {
            data: false,
          },
      ),
    );
  }
  //删除
  deleteNotice(params: DeleteParams): Observable<any> {
    return this.notificationApi.deleteNotice(params).pipe(
      map(
        x =>
          x?.data || {
            data: false,
          },
      ),
    );
  }

  /**
   * 是否显示立即前往
   *
   * @param type
   * @returns
   */
  // ifShowRiskLink(type: string) {
  //   const riskBusinessTypes = [
  //     'AbnormalMemberSupplementNoApproved',
  //     'RiskAssessmentCreate',
  //     'RiskAssessmentNoApproved',
  //     'WealthSourceCreate',
  //     'WealthSourceNoApproved',
  //   ];
  //   return riskBusinessTypes.includes(type);
  // }

  // clickRiskLink(type: string) {
  //   switch (type) {
  //     case 'AbnormalMemberSupplementNoApproved':
  //       this.riskService.showAuthTask$.next(true);
  //       break;
  //     case 'RiskAssessmentCreate':
  //       this.checkRiskFormStatus(type, 'edd');
  //       break;
  //     case 'RiskAssessmentNoApproved':
  //       this.router.navigate([this.appService.languageCode, 'risk-control', 'edd'], {
  //         queryParams: { status: 'rejected' },
  //       });
  //       break;
  //     case 'WealthSourceCreate':
  //       this.checkRiskFormStatus(type, 'proof-of-income');
  //       break;
  //     case 'WealthSourceNoApproved':
  //       this.router.navigate([this.appService.languageCode, 'risk-control', 'proof-of-income'], {
  //         queryParams: { status: 'rejected' },
  //       });
  //       break;
  //     default:
  //       break;
  //   }
  // }

  /**
   * 检查当前用户风险表单状态
   *
   * @param type
   * @param router
   */
  // async checkRiskFormStatus(type: string, router: string) {
  //   const formList = await firstValueFrom(this.riskApi.getRiskFrom());
  //   const formValue = formList.data.map(x => x.type)[0];
  //   this.riskService.handleFormStorage(true, formValue);
  //   if (formList.data.length) {
  //     this.riskService.riskFormList = formList.data;
  //     // 如果返回当前type则跳转对应页面
  //     if (type.includes(formList.data[0].type)) {
  //       setTimeout(() => {
  //         this.router.navigate([this.appService.languageCode, 'risk-control', router]);
  //       }, 0);
  //       return;
  //     }
  //   }
  //   console.log('提示过期>>>>>>>>>');
  // }
}
