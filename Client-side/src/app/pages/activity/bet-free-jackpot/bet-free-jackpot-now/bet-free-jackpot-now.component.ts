import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { FreeJackpotApi } from 'src/app/shared/apis/free-jackpot.api';
import { KycApi } from 'src/app/shared/apis/kyc-basic.api';
import { StandardPopupComponent } from 'src/app/shared/components/standard-popup/standard-popup.component';
import { AccountInforData } from 'src/app/shared/interfaces/account.interface';
import { OnUserOptions, UserGameList, UserOptions, UserUoList } from 'src/app/shared/interfaces/free-jackpot.interface';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { NativeAppService } from 'src/app/shared/service/native-app.service';
import { PopupService } from 'src/app/shared/service/popup.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { KycService } from '../../../kyc/kyc.service';
import { BetFreeJackpotService } from '../bet-free-jackpot.service';
@UntilDestroy()
@Component({
  selector: 'app-bet-free-jackpot-now',
  templateUrl: './bet-free-jackpot-now.component.html',
  styleUrls: ['./bet-free-jackpot-now.component.scss'],
})
export class BetFreeJackpotNowComponent implements OnInit {
  constructor(
    private popup: PopupService,
    private freeJackpotApi: FreeJackpotApi,
    private appService: AppService,
    private kycService: KycService,
    private toast: ToastService,
    public betFreeJackpotService: BetFreeJackpotService,
    private router: Router,
    private localeService: LocaleService,
    private nativeAppService: NativeAppService,
    private kycApi: KycApi
  ) {}

  get activitiesNo() {
    return this.betFreeJackpotService.activitiesNo;
  }

  get betFreeData() {
    return this.betFreeJackpotService.betFreeData;
  }

  editMode: boolean = false;

  events: UserGameList[] = [];

  userOptions: OnUserOptions[] = [];

  eventsUser: UserUoList[] = [];

  userObj?: UserOptions;

  userUid: string = '';

  logined!: boolean;

  progress!: boolean;

  appLoading!: boolean;

  maxScore?: number;

  maxTotalScore?: number;

  /** 当前选中的语言 */
  selectedLang: string = this.appService.languageCode;

  ngOnInit() {
    this.appLoading = true;
    this.freeJackpotApi.getActivityBaseInfo(this.activitiesNo).subscribe(res => {
      this.appLoading = false;
      if (res?.data) {
        if (res.data.status !== 1) {
          this.progress = false;
          return;
        }
        console.log('data', res.data);
        this.progress = true;
        this.maxScore = res.data.maxScore;
        this.maxTotalScore = res.data.maxTotalScore;
        this.loadData();
      }
    });
  }

  loadData() {
    this.appLoading = true;
    this.freeJackpotApi.getUserOptions(this.activitiesNo).subscribe(res => {
      this.appLoading = false;
      if (res?.data) {
        this.userObj = res.data;
        this.events = this.userObj.gameOptions || [];
        // 处理数据
        for (let i = 0; i < this.events.length; i++) {
          // 自动加上默认比分
          this.events[i].scoreHome = 0;
          this.events[i].scoreAway = 0;
          for (let j = 0; j < this.events[i].teamLangs.length; j++) {
            //  适配当前语言
            if (this.events[i].teamLangs[j].lang === this.selectedLang) {
              this.events[i].home = this.events[i].teamLangs[j].home;
              this.events[i].away = this.events[i].teamLangs[j].away;
            }
          }
        }

        //  已选择竞猜
        if (this.userObj.isJoined) {
          this.editMode = false;
          this.eventsUser = this.userObj.userOptions || [];
          for (let i = 0; i < this.events.length; i++) {
            for (let j = 0; j < this.eventsUser.length; j++) {
              if (this.eventsUser[j].id === this.events[i].id) {
                this.events[i].scoreHome = this.eventsUser[j].scoreHome;
                this.events[i].scoreAway = this.eventsUser[j].scoreAway;
                this.events[i].edited = true;
              }
            }
          }
        } else {
          this.editMode = true;
        }
      }
    });
  }

  submitVerify() {
    this.appService.userInfo$.pipe(untilDestroyed(this)).subscribe((v: AccountInforData | null) => {
      this.logined = !!v;
      if (this.logined) {
        // 订阅kyc状态更新
        this.kycApi.getUserKycStatus().subscribe(data => {
          if (data.length > 0) {
            const currentKyc = this.kycService.checkUserKycStatus(data);
            if (currentKyc.level < 1) {
              this.openTip(this.localeService.getValue('kyc_err_jop'), 'userCenter/kyc');
            } else {
              this.userUid = v?.uid as string;
              this.submit();
            }
          } else {
            this.openTip(this.localeService.getValue('kyc_err_jop'), 'userCenter/kyc');
          }
        });
      } else {
        this.openTip(this.localeService.getValue('log_reg_jop'), 'login');
      }
    });
  }

  openTip(tipText: string, tipsUrl: string) {
    this.popup.open(StandardPopupComponent, {
      disableClose: true,
      data: {
        description: tipText,
        type: 'warn',
        buttons: [{ text: this.localeService.getValue('confirm_button'), primary: true }],
        callback: () => {
          // 原生 方法
          if (this.appService.isNativeApp) {
            if (tipsUrl === 'login') {
              this.nativeAppService.setNoLogin();
            } else {
              this.nativeAppService.setNativeKyc();
            }
            return;
          }

          this.router.navigateByUrl(`${this.appService.languageCode}/${tipsUrl}`);
        },
      },
    });
  }

  submit() {
    this.popup.open(StandardPopupComponent, {
      data: {
        content: this.localeService.getValue('cof_cho_jop'),
        description: this.localeService.getValue('cof_cho_jop01'),
        type: 'success',
        buttons: [
          { text: this.localeService.getValue('cof_cho_jop02'), primary: false },
          { text: this.localeService.getValue('confirm_button'), primary: true },
        ],
        callback: () => {
          this.editMode = false;
          this.appLoading = true;
          this.userOptions = [];
          // 取出数值
          for (let i = 0; i < this.events.length; i++) {
            const userOptionsItem = {
              id: this.events[i].id,
              scoreHome: 0,
              scoreAway: 0,
            };
            if (this.events[i].edited) {
              userOptionsItem.scoreHome = this.events[i].scoreHome;
              userOptionsItem.scoreAway = this.events[i].scoreAway;
            }
            this.userOptions.push(userOptionsItem);
          }

          const params: any = {
            activityCode: this.activitiesNo,
            userAccount: this.userUid,
            userOptions: this.userOptions,
          };

          this.freeJackpotApi.setUserOptions(params).subscribe(res => {
            this.appLoading = false;
            if (res.code === 200) {
              this.toast.show({ message: this.localeService.getValue('op_s'), type: 'success', title: '' });
            } else {
              this.toast.show({ message: this.localeService.getValue('sub_f'), type: 'fail', title: '' });
            }
            this.loadData();
          });
        },
      },
    });
  }

  minus(item: any, type: string) {
    if (item['score' + type] === 0) return;
    item['score' + type] -= 1;
    item.edited = true;
  }

  add(item: any, type: string) {
    if (this.maxTotalScore && item['score' + 'Home'] + item['score' + 'Away'] >= this.maxTotalScore) return;

    if (this.maxScore && item['score' + type] >= this.maxScore) return;

    item['score' + type] += 1;
    item.edited = true;
  }

  scoreMinus(a: number, b: number) {
    return Math.abs(Number(a).minus(Number(b)));
  }

  toHistory() {
    this.router.navigate([this.appService.languageCode, 'activity', 'betfreejackpot', 'history']);
  }
}
