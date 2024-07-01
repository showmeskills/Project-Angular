import { Component, OnInit, Input } from '@angular/core';
import moment from 'moment';
import { AppService } from 'src/app/app.service';
import { DashboardApi } from 'src/app/shared/api/dashboard.api';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { WinDirective, WinColorDirective } from 'src/app/shared/directive/common.directive';
import { IconCountryComponent, CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';

@Component({
  selector: 'app-detail-popup',
  templateUrl: './detail-popup.component.html',
  styleUrls: ['./detail-popup.component.scss'],
  standalone: true,
  imports: [
    ModalTitleComponent,
    NgIf,
    NgFor,
    IconCountryComponent,
    CurrencyIconDirective,
    WinDirective,
    WinColorDirective,
    LabelComponent,
    AngularSvgIconModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    PaginatorComponent,
    AsyncPipe,
    FormatMoneyPipe,
    CurrencyValuePipe,
    LangPipe,
  ],
})
export class AnalysisDetailPopupComponent implements OnInit {
  constructor(
    public modal: MatModalRef<AnalysisDetailPopupComponent>,
    public appService: AppService,
    private api: DashboardApi
  ) {}

  @Input() type: any;
  @Input() ganmeRankTypeValue = 1;
  @Input() tenantId: any;
  @Input() curTime: any[] = [];
  @Input() countryCurrentCode: any;

  isLoading = false;
  pageSizes: number[] = PageSizes; // 调整每页个数的数组
  paginator: PaginatorState = new PaginatorState(); // 分页

  titleList: any[] = [
    { name: '存款申诉', value: 'depositAppeal', lang: 'dashboard.popup.depositAppeal' },
    { name: '游戏申诉', value: 'gameAppeal', lang: 'dashboard.popup.gameAppeal' },
    { name: '代理审核', value: 'agentReview', lang: 'dashboard.popup.affiliateRequest' },
    { name: '存款失败', value: 'depositFailed', lang: 'dashboard.popup.depositFailedt' },
    { name: '活跃用户', value: 'activeMembers', lang: 'dashboard.popup.activePlayer' },
    { name: '新首存', value: 'firstDeposit', lang: 'dashboard.popup.ftd' },
    { name: '新注册', value: 'newRegister', lang: 'dashboard.popup.registration' },
    {
      name: '游戏排行榜',
      value: 'ganmeRank',
      lang: ['dashboard.popup.casinoRanking', 'dashboard.popup.liveCasinoRanking'],
    },
    { name: '会员排行榜', value: 'memberRank', lang: 'dashboard.popup.playerRanking' },
    { name: '国家排行榜', value: 'coutryRank', lang: 'dashboard.popup.countryRanking' },
    { name: '货币排行榜', value: 'currencyRank', lang: 'dashboard.popup.currencyRanking' },
  ];

  // 头部筛选时间(YYYY-DD-MM)
  headerTime: any[] = [];

  sortData: any = {
    sort: '',
    isAsc: true,
  };

  list: any[] = []; // 列表数据

  /**  */
  curTitle() {
    const title = this.titleList.find((v) => v.value === this.type)?.lang;
    if (this.type === 'ganmeRank') {
      return title ? title[this.ganmeRankTypeValue - 1] : '-';
    }
    return title || '-';
  }

  curHeaderBg() {
    let imgName: any = 'frontPage-popup-1';
    if (['depositAppeal', 'gameAppeal'].includes(this.type)) imgName = 'frontPage-popup-1';
    if (this.type === 'agentReview') imgName = 'frontPage-popup-2';
    if (['depositFailed', 'firstDeposit'].includes(this.type)) imgName = 'frontPage-popup-3';
    if (['activeMembers', 'newRegister'].includes(this.type)) imgName = 'frontPage-popup-4';
    if (['ganmeRank', 'memberRank', 'coutryRank', 'currencyRank'].includes(this.type)) imgName = 'frontPage-popup-5';
    return { background: `url(./assets/images/member/${imgName}.svg) no-repeat center / 100%` };
  }

  ngOnInit() {
    // 时间初始化
    this.headerTime = this.curTime.length
      ? [moment(this.curTime[0]).format('YYYY-MM-DD'), moment(this.curTime[1]).format('YYYY-MM-DD')]
      : [];
    this.loadData();
  }

  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);
    this[this.type]();
  }

  onSort() {}

  /** 游戏排行榜 - 获取数据 */
  ganmeRank() {
    const parmas = {
      TenantId: this.tenantId,
      CountryCode: this.countryCurrentCode,
      BeginDate: this.headerTime[0],
      EndDate: this.headerTime[1],
      Top: 100,
      ...(this.sortData.sort
        ? {
            Sort: this.sortData.sort,
            IsAsc: this.sortData.isAsc,
          }
        : {}),
    };
    this.loading(true);
    this.api[this.ganmeRankTypeValue === 1 ? 'getslotchessrank' : 'getlivecasinorank'](parmas).subscribe((res) => {
      this.loading(false);
      if (Array.isArray(res)) this.list = res;
    });
  }

  /** 会员排行榜 - 获取数据 */
  memberRank() {
    const parmas = {
      TenantId: this.tenantId,
      CountryCode: this.countryCurrentCode,
      BeginDate: this.headerTime[0],
      EndDate: this.headerTime[1],
      Top: 100,
      ...(this.sortData.sort
        ? {
            Sort: this.sortData.sort,
            IsAsc: this.sortData.isAsc,
          }
        : {}),
    };
    this.loading(true);
    this.api.getUserGameRank(parmas).subscribe((res) => {
      this.loading(false);
      if (Array.isArray(res)) this.list = res;
    });
  }

  /** 国家排行榜 - 获取数据 */
  coutryRank() {
    const parmas = {
      TenantId: this.tenantId,
      BeginDate: this.headerTime[0],
      EndDate: this.headerTime[1],
      Top: 100,
      ...(this.sortData.sort
        ? {
            Sort: this.sortData.sort,
            IsAsc: this.sortData.isAsc,
          }
        : {}),
    };
    this.loading(true);
    this.api.getCountryGameRank(parmas).subscribe((res) => {
      this.loading(false);
      if (Array.isArray(res)) this.list = res;
    });
  }

  /** 货币排行榜 - 获取数据 */
  currencyRank() {
    const parmas = {
      TenantId: this.tenantId,
      CountryCode: this.countryCurrentCode,
      BeginDate: this.headerTime[0],
      EndDate: this.headerTime[1],
      Top: 100,
      ...(this.sortData.sort
        ? {
            Sort: this.sortData.sort,
            IsAsc: this.sortData.isAsc,
          }
        : {}),
    };
    this.loading(true);
    this.api.getCurrencyGameRank(parmas).subscribe((res) => {
      this.loading(false);
      if (Array.isArray(res)) this.list = res;
    });
  }

  // 排行榜 排序
  onRankSort(sortKey: any) {
    if (!this.list.length) return;

    if (this.sortData.isAsc === false && this.sortData.sort === sortKey) {
      this.sortData.sort = '';
      this.sortData.isAsc = true;
      this[this.type]();
      return;
    }

    if (!this.sortData.sort || this.sortData.sort !== sortKey) {
      this.sortData.sort = sortKey;
      this.sortData.isAsc = false;
    }

    this.sortData.isAsc = !this.sortData.isAsc;
    this[this.type]();
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }
}
