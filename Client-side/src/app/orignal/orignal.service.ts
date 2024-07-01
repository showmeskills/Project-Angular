import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { AppService } from '../app.service';
import { CurrenciesInterface } from '../shared/interfaces/deposit.interface';
import { LayoutService } from '../shared/service/layout.service';
import { ReceiveData } from './shared/interfaces/response.interface';
import { UserInfo } from './shared/interfaces/user-info.interface';

@Injectable({
  providedIn: 'root',
})
export class OrignalService {
  constructor(private layoutService: LayoutService, private appService: AppService) {
    this.layoutService.isH5$.subscribe(x => (this.isH5 = x));
  }

  currentCurrencyData!: CurrenciesInterface;
  isDigital: boolean = false;

  isH5!: boolean;
  tpid: string = '365'; //第三方Id
  deviceType: string = '1'; //pc:1,Mobile:2

  token!: string;
  /** 当前登录的用户信息 */
  currentUser!: UserInfo;
  userBalance$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  //用户余额刷新
  refreshUserBanlance$: Subject<boolean> = new Subject();
  /** 实时投注记录列表 */
  realHistoryList$: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  /** 消息提示 */
  showToast$: Subject<any> = new Subject();
  /** 原创是否登录完毕 */
  orignalLoginReady$: BehaviorSubject<boolean | null> = new BehaviorSubject<boolean | null>(null);
  /** 游戏类型 */
  gameName$: Subject<string> = new Subject();
  /** crash消息ws */
  crashMessage$: Subject<any> = new Subject();
  /**统计面板 */
  statisticsPanelState$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  /**发送统计数据 */
  chartMessage$: Subject<ReceiveData> = new Subject();
  /**
   * 跳转登录页面
   */
  jumpToLogin() {
    this.appService.jumpToLogin();
  }
}
