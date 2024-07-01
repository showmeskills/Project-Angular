import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { firstValueFrom } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { BankCardApi } from 'src/app/shared/apis/bank-card.api';
import { KycApi } from 'src/app/shared/apis/kyc-basic.api';
import {
  StandardPopupComponent,
  StandardPopupData,
} from 'src/app/shared/components/standard-popup/standard-popup.component';
import { AccountInforData } from 'src/app/shared/interfaces/account.interface';
import { BankCard, DeleteParam } from 'src/app/shared/interfaces/bank-card.interface';
import { BatchdeleteParam } from 'src/app/shared/interfaces/tokenaddress.interface';
import { General2faverifyService } from 'src/app/shared/service/general2faverify.service';
import { KycDialogService } from 'src/app/shared/service/kyc-dialog.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { PopupService } from 'src/app/shared/service/popup.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { KycService } from '../../kyc/kyc.service';
import { AddBankCardComponent } from './add-bank-card/add-bank-card.component';

@UntilDestroy()
@Component({
  selector: 'app-bankcard-management',
  templateUrl: './bankcard-management.component.html',
  styleUrls: ['./bankcard-management.component.scss'],
})
export class BankcardManagementComponent implements OnInit {
  isH5!: boolean;
  bottomBarActive: boolean = true;

  constructor(
    private dialog: MatDialog,
    private bankCardApi: BankCardApi,
    private kycService: KycService,
    private popupService: PopupService,
    private general2faverifyService: General2faverifyService,
    private toast: ToastService,
    private layout: LayoutService,
    private kycDialogService: KycDialogService,
    private localeService: LocaleService,
    private kycApi: KycApi,
    private appService: AppService
  ) {
    //订阅是否h5
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    //订阅移动设备软键盘
    this.layout.h5Keyboard$.pipe(untilDestroyed(this)).subscribe(e => (this.bottomBarActive = !e));
  }

  selectedCurrency: any; //选中的币种
  cardList: any[] = []; //银行卡列表
  loading: boolean = true; //加载中
  checkAll: boolean = false; //是否全部选中
  selectLength: number = 0; //选中的银行卡
  editMode: boolean = false; //管理（多选）模式
  h5BottomOperateAreaSticky!: boolean;

  kycLoading: boolean = false;

  userInfo: AccountInforData | undefined | null;

  ngOnInit() {
    this.loadCardList();
    this.appService.userInfo$.pipe(untilDestroyed(this)).subscribe(userInfo => {
      this.userInfo = userInfo;
    });
  }

  //单选银行卡
  onCheckCard() {
    this.selectLength = 0;
    this.selectLength = this.cardList.filter(x => x.checked).length;
    this.checkAll = this.selectLength === this.cardList.filter(x => !x.isLock).length;
  }

  //全选checkbox
  setAll() {
    this.cardList.forEach(x => {
      if (!x.isLock) x.checked = this.checkAll;
    });
    this.selectLength = this.cardList.filter(x => x.checked).length;
  }

  /**
   * 获取银行卡
   */
  loadCardList() {
    this.loading = true;
    this.bankCardApi.getBankCard().subscribe(resp => {
      if (resp?.data) {
        this.cardList = resp.data;
        this.cardList.forEach(x => {
          x.isShow = false;
          x.checked = false;
        });
      }
      this.loading = false;
    });
  }

  //kyc权限判断：需过初级
  async addBankCard() {
    if (this.cardList.length == 5) {
      this.toast.show({ message: this.localeService.getValue('bankcard_max'), type: 'fail' });
      return;
    }

    this.kycLoading = true;
    this.kycApi.getUserKycStatus().subscribe(data => {
      const currentKyc = this.kycService.checkUserKycStatus(data);
      this.kycLoading = false;
      // 亚洲 用户取消提款中级验证
      const needKycLevelNumber = this.userInfo?.isEurope && this.kycService.getSwitchEuKyc ? 2 : 1;

      // 小于 中级
      if (Number(currentKyc?.level || 0) < needKycLevelNumber) {
        this.dialog.closeAll();

        if (data[1]?.status === 'P') {
          this.popupService.open(StandardPopupComponent, {
            speed: 'faster',
            data: {
              type: 'warn',
              content: this.localeService.getValue('safety_rem00'),
              buttons: [{ text: this.localeService.getValue('sure_btn'), primary: false }],
              description: this.localeService.getValue('status_notice'),
            },
          });

          return;
        }

        this.popupService.open(StandardPopupComponent, {
          speed: 'faster',
          data: {
            type: 'warn',
            content: this.localeService.getValue('to_ke_u_safe00'),
            buttons: [{ text: this.localeService.getValue('verification'), primary: true }],
            description: this.localeService.getValue('kyc_befo_imm00'),
            callback: () => {
              if (data[0]?.status !== 'S') {
                this.kycDialogService.openPrimaryVerifyDialog();
              } else if (data[1]?.status !== 'S') {
                this.kycDialogService.openMidVerifyDialog();
              }
            },
          },
        });
        return;
      }

      //通过初级后获取姓名，传入添加弹窗
      const kycName = currentKyc?.value || '';

      this.dialog
        .open(AddBankCardComponent, {
          disableClose: true,
          panelClass: 'bankcard-container',
          autoFocus: false,
          data: { kycName },
        })
        .afterClosed()
        .subscribe((success: any) => {
          if (success) this.loadCardList();
        });
    });
  }

  // kycErrorDialog(errorMassage: string) {
  //   this.dialog.open(KycErrorDialogComponent, {
  //     panelClass: 'custom-dialog-container',
  //   });
  // }

  trackMethod(index: any, item: any) {
    return item.id;
  }

  /**
   * 设为默认卡
   *
   * @param card
   * @returns
   */
  async setDefault(card: any) {
    const result = await firstValueFrom(this.bankCardApi.setDefaultCard(card.id));
    if (result.success) {
      this.toast.show({ message: this.localeService.getValue('def_card_s'), type: 'success' });
      this.loadCardList();
      return;
    }
    this.toast.show({ message: this.localeService.getValue('def_card_f'), type: 'fail' });
  }

  //批量删除
  handelBatchDelete() {
    this.deleteBatchCards(this.cardList.filter(x => x.checked));
  }

  deleteBatchCards(card: BankCard | BankCard[]) {
    const param: BatchdeleteParam = {
      ids: Array.isArray(card) ? card.map(x => x.id) : [card.id],
      key: '',
    };

    const confirmData: StandardPopupData = {
      type: 'warn',
      content:
        param.ids.length > 1
          ? this.localeService.getValue('del_bank_ca00')
          : this.localeService.getValue('del_bank_ca01'),
      description: this.localeService.getValue('oper_can_be00'),
    };
    //确认弹窗
    this.popupService.open(StandardPopupComponent, {
      speed: 'faster',
      data: {
        ...confirmData,
        callback: () => {
          //2fa验证弹窗
          this.general2faverifyService.launch('BatchDelBankCard').subscribe(async res => {
            if (res.status) {
              //正式请求删除
              param.key = res.key;
              this.bankCardApi.batchDeleteCard(param).subscribe((res: any) => {
                if (res?.success && res?.data) {
                  this.toast.show({
                    message: this.localeService.getValue('dele_allcard_s'),
                    type: 'success',
                  });
                  //刷新列表
                  this.selectLength = 0;
                  this.editMode = false;
                  this.loadCardList();
                } else {
                  this.toast.show({
                    message: this.localeService.getValue('dele_card_f'),
                    type: 'fail',
                  });
                }
              });
            }
          });
        },
      },
    });
  }

  // 删除单张
  deleteCard(card: BankCard) {
    const param: DeleteParam = {
      id: card.id,
      key: '',
    };
    const confirmData: StandardPopupData = {
      type: 'warn',
      content: this.localeService.getValue('del_bank_ca01'),
      description: this.localeService.getValue('oper_can_be00'),
    };

    //确认弹窗
    this.popupService.open(StandardPopupComponent, {
      speed: 'faster',
      data: {
        ...confirmData,
        callback: () => {
          //2fa验证弹窗
          this.general2faverifyService.launch('DelBankCard').subscribe(async res => {
            if (res.status) {
              //正式请求删除
              param.key = res.key;
              this.bankCardApi.deleteCard(param).subscribe(res => {
                if (res?.success && res?.data) {
                  this.toast.show({
                    message: this.localeService.getValue('dele_card_s'),
                    type: 'success',
                  });
                  //刷新列表
                  this.loadCardList();
                } else {
                  this.toast.show({
                    message: this.localeService.getValue('dele_card_f'),
                    type: 'fail',
                  });
                }
              });
            }
          });
        },
      },
    });
  }

  //判断是否开启底部区域 Sticky 模式
  h5BottomOperateAreaintersectChange(entries: IntersectionObserverEntry[]) {
    entries.forEach(x => {
      // x.boundingClientRect.top > 200 用于剔除向上滚动导致的消失
      this.h5BottomOperateAreaSticky = x.intersectionRatio !== 1 && x.boundingClientRect.top > 200;
    });
  }
}
