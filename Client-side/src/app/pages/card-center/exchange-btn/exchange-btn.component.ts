import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  WritableSignal,
  computed,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { BonusApi } from 'src/app/shared/apis/bonus.api';
import { PaginatorState } from 'src/app/shared/components/paginator/paginator.module';
import { ExchangeCard } from 'src/app/shared/interfaces/bonus.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { PopupService } from 'src/app/shared/service/popup.service';
import { ToastService } from 'src/app/shared/service/toast.service';

@Component({
  selector: 'app-exchange-btn',
  templateUrl: './exchange-btn.component.html',
  styleUrls: ['./exchange-btn.component.scss'],
})
export class ExchangeBtnComponent implements OnInit {
  constructor(
    private layoutService: LayoutService,
    private appService: AppService,
    private popup: PopupService,
    private bonusApi: BonusApi,
    private toast: ToastService,
    private localeService: LocaleService,
    private router: Router
  ) {}

  /** after close popup reload data */
  @Output() reloadData = new EventEmitter();

  /** 用户是否登录 */
  logined = toSignal(this.appService.userInfo$);

  /** 是否是 H5模式 */
  isH5 = toSignal(this.layoutService.isH5$);

  /** 兑换码弹窗 */
  @ViewChild('exchangeWeb') exchangeWebPopupRef!: TemplateRef<Element>;
  exchangeWebPopup!: MatDialogRef<Element>;

  /** 卡券兑换分页面 */
  exchangePaginator: PaginatorState = {
    page: 1,
    pageSize: 10,
    total: 0,
  };

  /** 兑换码 */
  exchangeNumber: string = '';

  /** 兑换码 loading */
  exchangeNumberLoading = false;

  /** 兑换记录 */
  exchangeHistroyList: WritableSignal<ExchangeCard[]> = signal([]);
  renderExchangeHistroyList = computed(() => {
    if (this.exchangeHistroyList().length > 0) return this.exchangeHistroyList();
    return [];
  });

  /** 交易记录loading */
  exchangeHistroyLoading = false;

  ngOnInit(): void {}

  /** 点击打开弹窗 */
  onClickOpenExchangePopup() {
    if (!this.logined()) {
      this.appService.saveUrl();
      this.router.navigateByUrl(`/${this.appService.languageCode}/` + 'login');
      return;
    }
    this.exchangePaginator = {
      page: 1,
      pageSize: 10,
      total: 0,
    };
    this.exchangeNumber = '';
    this.exchangeHistroyList.set([]);

    if (!this.isH5()) {
      this.exchangeWebPopup = this.popup.open(this.exchangeWebPopupRef, {
        speed: 'faster',
        autoFocus: false,
        disableClose: true,
      });
    } else {
      this.exchangeWebPopup = this.popup.open(this.exchangeWebPopupRef, {
        inAnimation: 'fadeInRight',
        outAnimation: 'fadeOutRight',
        speed: 'fast',
        autoFocus: false,
        isFull: true,
      });
    }

    this.getExchangeHistoryData();
  }

  /** 获取兑换劵码记录 */
  getExchangeHistoryData() {
    this.exchangeHistroyLoading = true;
    const params = {
      pageIndex: this.exchangePaginator.page,
      pageSize: this.exchangePaginator.pageSize,
    };
    this.bonusApi.getExchangeReceiveInfo(params).subscribe(data => {
      this.exchangeHistroyLoading = false;
      if (this.isH5()) {
        this.exchangeHistroyList.set([...this.exchangeHistroyList(), ...data.list]);
      } else {
        this.exchangeHistroyList.set(data.list || []);
      }
      this.exchangePaginator.total = data?.total || 0;
    });
  }

  /** 提交兑换 */
  onClickExchangeSubmit() {
    this.exchangeNumberLoading = true;
    this.bonusApi.setExchangeReceive({ exchangeCode: this.exchangeNumber }).subscribe(data => {
      this.exchangeNumberLoading = false;
      if (data) {
        this.toast.show({ message: `${this.localeService.getValue('exchange_succ')}`, type: 'success' });
      } else {
        this.toast.show({ message: `${this.localeService.getValue('exchange_fail')}`, type: 'fail' });
      }
      this.reloadData.emit();
      this.exchangeWebPopup.close();
    });
  }
}
