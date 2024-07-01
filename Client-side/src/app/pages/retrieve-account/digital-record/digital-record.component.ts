import { Location } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { firstValueFrom } from 'rxjs';
import { filter, finalize } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { RetrieveAccountApi } from 'src/app/shared/apis/retrieve-account.api';
import { PaginatorState } from 'src/app/shared/components/paginator/paginator.module';
import { SelectCurrencyComponent } from 'src/app/shared/components/select-currency/select-currency.component';
import { CurrenciesInterface, TokenNetworksFlatInterface } from 'src/app/shared/interfaces/deposit.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { PopupService } from 'src/app/shared/service/popup.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { HelpCenterService } from '../../help-center/help-center.service';
import { SelectNetworkDialogComponent } from '../../top-up/digital/select-network-dialog/select-network-dialog.component';
import { RetrieveAccountService } from '../retrieve-account.service';

@UntilDestroy()
@Component({
  selector: 'app-digital-record',
  templateUrl: './digital-record.component.html',
  styleUrls: ['./digital-record.component.scss'],
})
export class DigitalRecordComponent implements OnInit {
  constructor(
    private popup: PopupService,
    private layout: LayoutService,
    private retrieveAccountApi: RetrieveAccountApi,
    private toast: ToastService,
    public appService: AppService,
    private location: Location,
    private dialog: MatDialog,
    private localeService: LocaleService,
    public helpCenterService: HelpCenterService,
    private router: Router,
    private retrieveAccountService: RetrieveAccountService
  ) {}
  @ViewChild('iSearch', { static: false }) private searchElement!: ElementRef;
  @ViewChild('orderTicket') orderTicketRef!: TemplateRef<any>;
  orderTicketPopup!: MatDialogRef<any>;

  isH5!: boolean;
  headerName: string = this.localeService.getValue('rech_arriv_inqu00');

  isDropCurrency: boolean = false;
  historyList: any = [];
  isSelected: boolean = false;

  fromPgae: number = 1; //1://2://3:
  showSearchPage: boolean = false;
  seletedCurrencyItem!: CurrenciesInterface;
  isOpen: boolean = false;
  showNotice: boolean = true;
  amount: string = '';
  txId: string = '';
  searchCurreny: string = '';
  submitCollectionData: any = {};
  isDigital: boolean = false;

  /** 申请记录显示单张 */
  singleCard: boolean = false;
  loading: boolean = false;
  paginator: PaginatorState = {
    page: 1,
    pageSize: 10,
    total: 0,
  };
  /** 选择的网络 */
  selectedNetwork?: TokenNetworksFlatInterface;
  singleData: any = {};
  singleAppealId!: string;

  //目前没有数据。测试使用。
  // mock = [
  //   {
  //     appealId: "string",
  //     orderNumber: "string",
  //     currency: "Unknown",
  //     paymentMethod: "string",
  //     fee: 0,
  //     appealTime: 0,
  //     amount: 0,
  //     status: "Pending",
  //     coinDepositAddress: "string"
  //   }
  // ]

  ngOnInit() {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => {
      this.isH5 = e;
    });

    this.retrieveAccountService.digitalRecordList$
      .pipe(
        untilDestroyed(this),
        filter(x => typeof x === 'boolean' && x === true)
      )
      .subscribe(isReload => {
        if (isReload) {
          this.loadData();
          this.retrieveAccountService.digitalRecordList$.next(false);
        }
      });

    this.loadData();
  }
  // 获取虚拟货币的申请
  loadData() {
    this.loading = true;
    const params = {
      page: this.paginator.page,
      pageSize: this.paginator.pageSize,
    };
    this.retrieveAccountApi
      .getAppealList(params)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(data => {
        this.paginator.total = data.total;
        this.historyList = data.list;
        if (this.singleAppealId) {
          this.historyList.map((item: any) => {
            if (item.appealId === this.singleAppealId) {
              this.singleData = item;
            }
          });
        }
      });
  }

  /**
   * 币种选择弹窗
   */
  handleSelectCurrency() {
    this.dialog
      .open(SelectCurrencyComponent, {
        panelClass: 'custom-dialog-container',
        data: {
          showBalance: false,
          isDigital: true,
        },
      })
      .afterClosed()
      .subscribe(result => {
        if (result) this.seletedCurrencyItem = result;
      });
  }

  handleSelectReason(isDigital: boolean) {
    this.isSelected = true;
    if (isDigital) {
      this.isDigital = false;
    } else {
      this.isDigital = true;
    }
  }

  async openOrderDialog() {
    const isTxIdExist = await this.checkTxIdExists();
    if (isTxIdExist) return;
    if (this.isH5) {
      this.orderTicketPopup = this.popup.open(this.orderTicketRef, {
        disableClose: true,
        speed: 'fast',
        autoFocus: false,
        isFull: true,
      });
    } else {
      this.orderTicketPopup = this.popup.open(this.orderTicketRef, {
        disableClose: true,
        speed: 'fast',
        autoFocus: false,
        isFull: false,
      });
    }
  }

  /**
   * Input Blur事件
   *
   * @param element
   */
  onBlur(element: any) {
    //延迟200MS，防止clear无法点击
    element.timer = setTimeout(() => {
      element.isFocus = false;
    }, 200);
  }

  /**
   * 金额则验证
   *
   * @param element
   */
  onAmountInput(element: any) {
    this.amount = element.value;
  }

  // onTxIdInput(element: any) {
  //   this.txId = element.value;
  //   if (this.txId && this.seletedCurrencyItem?.currency) {
  //     this.checkTxIdExists();
  //   } else {
  //     this.toast.show({ message: this.localeService.getValue('txid_err'), type: 'fail' });
  //   }
  // }

  /**
   * 判断虚拟货币TxId 是否存在申述
   */
  private async checkTxIdExists() {
    this.loading = true;
    const params = {
      currency: this.seletedCurrencyItem.currency || '',
      txId: this.txId,
    };
    const result = await firstValueFrom(this.retrieveAccountApi.checkTxIdExists(params));
    this.loading = false;
    if (result?.data === false) {
      this.showNotice = !result.data;
    } else {
      this.toast.show({ message: result?.message ?? this.localeService.getValue('sys_unava'), type: 'fail' });
    }
    return !!result.data;
  }

  // enter键操作
  @HostListener('body:keydown.enter', ['$event'])
  handleAppliciation(type: string) {
    if (!this.isSelected) return;
    //点击事件
    if (!this.isDigital) type = 'noDigital';
    switch (type) {
      case 'back':
        this.fromPgae = 1;
        this.headerName = this.localeService.getValue('rech_arriv_inqu00');
        break;
      case 'next':
        this.fromPgae = 2;
        this.headerName = this.localeService.getValue('rech_arriv_inqu01');
        break;
      case 'noDigital':
        this.router.navigate([this.appService.languageCode, 'retrieve-account', 'currency-record']);
        break;
    }
  }

  //按钮状态
  formatStatus(status: string) {
    //订单状态：（pending:待处理,Finish:处理完毕,Supplement:待补充,Rejected:拒绝申请,Cancel:取消）
    let x = '';
    switch (status) {
      case 'Pending':
        x = this.localeService.getValue('processing');
        break;
      case 'Finish':
        x = this.localeService.getValue('done');
        break;
      case 'Cancel':
        x = this.localeService.getValue('cancell00');
        break;
      case 'Supplement':
        x = this.localeService.getValue('supp_doc');
        break;
      case 'Rejected':
        x = this.localeService.getValue('reje00');
        break;
      case 'Processing':
        x = this.localeService.getValue('processing');
        break;
      case 'TimeOut':
        x = this.localeService.getValue('timeout');
        break;
      case 'stop':
        x = this.localeService.getValue('appli_cancell00');
        break;
    }
    return x;
  }

  openAllHistory() {
    this.fromPgae = 1;
    this.headerName = this.localeService.getValue('rech_arriv_inqu00');
    // this.fromPgae = 3;
    // this.headerName = this.localeService.getValue('appli_redcor00');
    // this.singleCard = false;
  }

  handleExpend(item: any) {
    item.isOpen = !item.isOpen;
  }

  //顶部返回
  back(page: number) {
    switch (page) {
      case 1:
        this.location.back();
        //this.router.navigate([this.appService.languageCode, "wallet", "history", "deposit"]);
        break;
      case 2:
        this.fromPgae = 1;
        this.headerName = this.localeService.getValue('rech_arriv_inqu00');
        break;
      case 3:
        this.fromPgae = 2;
        this.headerName = this.localeService.getValue('rech_arriv_inqu01');
        break;
    }
  }

  submit() {
    this.loading = true;
    this.submitCollectionData = {
      currency: this.seletedCurrencyItem.currency,
      amount: this.amount,
      network: this.selectedNetwork?.networkInfo?.network,
      txId: this.txId,
    };
    this.retrieveAccountApi
      .depositByCoin(this.submitCollectionData)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(data => {
        if (!data?.success) {
          this.toast.show({ message: data.message ?? this.localeService.getValue('sys_busy'), type: 'fail' });
        } else if (data?.data?.length) {
          this.toast.show({ message: this.localeService.getValue('appeal_s'), type: 'success' });
          this.singleCard = true;
          this.fromPgae = 1;
          this.headerName = this.localeService.getValue('appli_redcor00');
          this.singleAppealId = data.data;
          this.amount = '';
          this.txId = '';
          this.selectedNetwork = undefined;
          this.showNotice = true;
          this.loadData();
        } else {
          this.toast.show({ message: this.localeService.getValue('appeal_f'), type: 'fail' });
        }
      });

    this.orderTicketPopup.close();
    this.back(2);
  }

  canSubmit() {
    return this.isSelected;
  }

  isCrrect() {
    if (this.selectedNetwork) {
      return (
        !!Number(this.amount) &&
        !!this.txId?.length &&
        !!this.seletedCurrencyItem &&
        !!this.selectedNetwork!.networkInfo.network.length &&
        this.showNotice
      );
    } else {
      return false;
    }
  }

  /**
   * 选择网络
   */
  handleSelectNetWork() {
    if (this.seletedCurrencyItem?.currency) {
      this.dialog.open(SelectNetworkDialogComponent, {
        panelClass: 'custom-dialog-container',
        data: {
          callback: this.closeSelectNetwordCallBack.bind(this),
          selectedCurrency: this.seletedCurrencyItem,
          isDeposit: true,
        },
      });
    } else {
      this.toast.show({ message: this.localeService.getValue('choose_depo'), type: 'fail' });
    }
  }

  /**
   * SelectNetworkDialogComponent 关闭后触发
   *
   * @param data
   */
  closeSelectNetwordCallBack(data: TokenNetworksFlatInterface) {
    this.selectedNetwork = data;
  }

  /**
   * ENTER 键提交
   */
  checkToSubmit() {
    if (!this.isCrrect()) return;
    this.openOrderDialog();
  }

  /**@onRedirectFaq 跳转FAQ详情 */
  onRedirectFaq() {
    const config: {
      mainPage: string;
      isDigitalCurrency: {
        categoryId: string;
        id: string;
      };
      isLegalCurrency: {
        categoryId: string;
        id: string;
      };
    } = JSON.parse(this.appService.tenantConfig.config.helpCenterConfig);

    if (!this.isSelected) {
      this.router.navigateByUrl(`${this.appService.languageCode}/help-center/faq/${config.mainPage}`);
    } else {
      if (this.isDigital) {
        this.helpCenterService.jumpToDetailPage({
          categoryCode: 'faq',
          categoryId: config.isDigitalCurrency.categoryId,
          id: config.isDigitalCurrency.id,
        });
      } else {
        this.helpCenterService.jumpToDetailPage({
          categoryCode: 'faq',
          categoryId: config.isLegalCurrency.categoryId,
          id: config.isLegalCurrency.id,
        });
      }
    }
  }
  //补充资料
  handleSupplement(appealId: any) {
    this.router.navigate([this.appService.languageCode, 'retrieve-account', 'currency-record'], {
      queryParams: { appealId: appealId },
    });
  }
}
