import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { AppService } from 'src/app/app.service';
import { OwlDateTimeModule } from 'src/app/components/datetime-picker';
import { RiskApi } from 'src/app/shared/api/risk.api';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { VipNamePipe } from 'src/app/shared/pipes/common.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';

@Component({
  selector: 'ip-monitoring-query',
  templateUrl: './query.component.html',
  styleUrls: ['./query.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    PaginatorComponent,
    TimeFormatPipe,
    FormatMoneyPipe,
    LangPipe,
    OwlDateTimeModule,
    EmptyComponent,
    LoadingDirective,
    LabelComponent,
    AngularSvgIconModule,
    NgbPopover,
    VipNamePipe,
    CurrencyValuePipe,
    CurrencyIconDirective,
  ],
})
export class IpMonitoringQueryComponent implements OnInit {
  constructor(
    private appService: AppService,
    private riskApi: RiskApi,
    private activatedRoute: ActivatedRoute
  ) {
    const { tenantId, ip, date } = this.activatedRoute.snapshot.queryParams;

    this.tenantId = tenantId;
    this.ip = ip;
    this.date = date;
  }

  /** 商户ID */
  tenantId;
  /** IP */
  ip;
  /** 日期 */
  date;

  /** 页大小 */
  pageSizes: number[] = PageSizes;
  detailPageSizes: number[] = PageSizes;

  /** 分页 */
  paginator: PaginatorState = new PaginatorState();
  detailPaginator: PaginatorState = new PaginatorState();

  /** 获取详情loading */
  detailLoading = false;

  /** 列表数据 */
  list = [];

  /** 详情列表数据 */
  detailList = [];

  ngOnInit() {
    this.loadData(true);
    this.detailPaginator.pageSize = 10;
  }

  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);

    const parmas = {
      tenantId: this.tenantId,
      ip: this.ip,
      date: this.date,
      pageIndex: this.paginator.page,
      pageSize: this.paginator.pageSize,
    };

    this.appService.isContentLoadingSubject.next(true);
    this.riskApi.getuseriplist(parmas).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      this.list = Array.isArray(res?.list) ? res.list.map((v) => ({ ...v, expand: false })) : [];
      this.paginator.total = res?.total || 0;
    });
  }

  operate(item, index) {
    item.expand = !item.expand;

    // 开启 - 除了正在打开的，其他操作全部关闭
    if (item.expand) {
      this.list.forEach((v: any, j) => {
        if (index !== j) v.expand = false;
      });
    }

    // 关闭 - 无需请求
    if (!item.expand) return;

    this.getUserIpDetail(item, true);
  }

  getUserIpDetail(item, resetPage = false) {
    resetPage && (this.detailPaginator.page = 1);

    const parmas = {
      tenantId: this.tenantId,
      uid: item.uid,
      date: item.date,
      ip: item.createIp,
      pageIndex: this.detailPaginator.page,
      pageSize: this.detailPaginator.pageSize,
    };
    this.detailLoading = true;
    this.riskApi.getuseripdetail(parmas).subscribe((res) => {
      this.detailLoading = false;
      this.detailList = Array.isArray(res?.list) ? res.list : [];
      this.detailPaginator.total = res?.total || 10;
    });
  }

  /**
   * 判断游戏icon是否存在
   * @Author FrankLin
   */
  isGameIcon(arr: number[], item: any) {
    if (!Array.isArray(item)) {
      return false;
    }
    return item.some((res) => arr.includes(res.gameCategory));
  }

  /**
   * 判断显示厂商
   * @Author FrankLin
   */
  showGameMaker(arr: number[], item: any): string {
    if (!Array.isArray(item)) {
      return '';
    }
    let gameMaker = [];
    item.forEach((res) => {
      if (arr.includes(res.gameCategory)) {
        gameMaker = gameMaker.concat(res.gameProviders);
      }
    });
    return gameMaker.join(', ');
  }
}
