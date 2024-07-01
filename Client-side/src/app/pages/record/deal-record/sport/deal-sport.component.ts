import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import html2canvas from 'html2canvas';
import { firstValueFrom } from 'rxjs';
import { UserAssetsService } from 'src/app/pages/user-asset/user-assets.service';
import { FriendApi } from 'src/app/shared/apis/friend.api';
import { DefaultLink } from 'src/app/shared/interfaces/friend.interface';
import { SportDealRecord, SportDealRecordDetail } from 'src/app/shared/interfaces/gameorder.interface';
import { RateItem } from 'src/app/shared/interfaces/wallet.interface';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { PopupService } from 'src/app/shared/service/popup.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { DealRecordService } from '../deal-record.service';

@Component({
  selector: 'app-deal-sport',
  templateUrl: './deal-sport.component.html',
  styleUrls: ['./deal-sport.component.scss'],
})
export class DealSportComponent implements OnInit {
  constructor(
    public dealRecordService: DealRecordService,
    private toast: ToastService,
    private localeService: LocaleService,
    private friendApi: FriendApi,
    private popup: PopupService,
    private userAssetsService: UserAssetsService,
  ) {}

  @Input() dealDetailData!: SportDealRecordDetail[];
  @Input() dataItem!: SportDealRecord;
  @Input() isH5!: boolean;
  @Input() show!: 'item' | 'detail';

  @Output() clickItem: EventEmitter<any> = new EventEmitter();

  @ViewChild('shareRef') shareRef!: TemplateRef<any>;

  sharePopup!: MatDialogRef<any>;

  expand!: boolean;

  tabIndex: number = 0; // 串关注单当前索引

  shareData: {
    tournamentName: string;
    betTime: number;
    teamA: string;
    teamB: string;
    /**单式就是主单赔率，串关就是子单的赔率 */
    odds: number;
    betContent: string;
    betoptionName: string;
  }[] = [];

  shareAmounts!: {
    /**交易金额（已换算成USDT） */
    betAmount: number;
    /**输赢或预期返还（已换算成USDT） */
    resultAmount: number | null;
  };

  shareText: string = '';
  rates!: RateItem[];
  readyToShare!: boolean;
  defaultLink!: DefaultLink;

  ngOnInit() {}

  // 串关swiper滑动事件
  slideChange = (index: number) => {
    this.tabIndex = index;
  };

  // 判断有没有' v '，没有的话进入下一步
  // 判断有没有' vs '，没有的话进入下一步
  // 判断有没有' VS '，没有的话进入下一步
  // 直接显示eventName，并隐藏tournamentName
  getTeamName(eventName: string) {
    if (!eventName) return [];
    const tags = [' v ', ' vs ', ' VS ', ' -vs- '];
    for (const tag of tags) {
      if (eventName.includes(tag)) {
        const names = eventName.split(tag);
        return [names[0], names[1]];
      }
    }
    return [eventName];
  }

  pureOdds(odds: string | number): number {
    return Number(String(odds).replace(/[^0-9.]/g, ''));
  }

  exchange() {}

  coming() {
    this.toast.show({
      message: `${this.localeService.getValue('comming')}, ${this.localeService.getValue('waiting')}`,
      title: this.localeService.getValue('hint'),
      type: 'fail',
    });
  }

  downloadImg() {
    html2canvas(document.querySelector('#share_images_container')!, { useCORS: true }).then(canvas => {
      const aDom = document.createElement('a');
      aDom.setAttribute('download', `share_${Date.now()}.png`);
      aDom.setAttribute('target', '_blank');
      aDom.href = canvas.toDataURL('image/png');
      aDom.click();
    });
  }

  /**分享 */
  async share() {
    this.readyToShare = false;

    this.sharePopup = this.popup.open(this.shareRef, {
      isFull: true,
    });

    // 准备汇率
    if (!this.rates) {
      const res = this.userAssetsService.allRate.value;
      if (res?.rates && res.rates.length > 0) {
        this.rates = res.rates;
      }
    }

    // 准备推荐链接
    if (!this.defaultLink) {
      const res = await firstValueFrom(this.friendApi.getDefault());
      if (res) {
        this.defaultLink = res;
        this.shareText = this.localeService.getValue('join_g_m') + ' ' + res.inviteUrl;
      }
    }

    if (this.dataItem.subOrderList) {
      this.shareData = this.dataItem.subOrderList.map(x => {
        const teamName = this.getTeamName(x.eventName);
        const odds = this.pureOdds(x.detailOdds);
        return {
          tournamentName: x.tournamentName,
          betTime: x.betTime,
          teamA: teamName[0],
          teamB: teamName[1],
          odds: odds,
          betContent: x.betContent,
          betoptionName: x.betoptionName,
        };
      });
    } else {
      const teamName = this.getTeamName(this.dataItem.gameDetail.eventName);
      this.shareData = [
        {
          tournamentName: this.dataItem.gameDetail.tournamentName,
          betTime: this.dataItem.betTime,
          teamA: teamName[0],
          teamB: teamName[1],
          odds: this.pureOdds(this.dataItem.odds),
          betContent: this.dataItem.gameDetail.betContent,
          betoptionName: this.dataItem.gameDetail.betoptionName,
        },
      ];
    }

    const rate = this.rates.find(x => x.currency === this.dataItem.currency)?.rate || 0;
    let resultAmount = 0;

    // Confirm Unsettlement 确认中、未结算2个状态按未结算方式处理
    // 取消 已结算 兑现 未接受都以已结算的方式处理
    if (['Cancel', 'Settlement', 'CashOut', 'NonAccept'].includes(this.dataItem.status)) {
      resultAmount = this.dataItem.payoutAmount;
    } else {
      const totalOdds = this.shareData.reduce((a, b) => a * b.odds, 1);
      // 本金 * 总赔率
      resultAmount = this.dataItem.betAmount.subtract(totalOdds);
    }

    this.shareAmounts = {
      betAmount: this.dataItem.betAmount.subtract(rate),
      resultAmount: resultAmount !== null ? resultAmount.subtract(rate) : resultAmount,
    };

    this.readyToShare = true;
  }

  towLineAmount = false;
  checkSize(el: HTMLElement) {
    if (el.clientHeight > 20) {
      this.towLineAmount = true;
    }
  }
}
