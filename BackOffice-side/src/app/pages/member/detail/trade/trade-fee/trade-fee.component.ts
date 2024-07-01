import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { MemberApi } from 'src/app/shared/api/member.api';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { WinDirective, WinColorDirective } from 'src/app/shared/directive/common.directive';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-trade-fee',
  templateUrl: './trade-fee.component.html',
  styleUrls: ['./trade-fee.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    WinDirective,
    WinColorDirective,
    CurrencyIconDirective,
    NgIf,
    AngularSvgIconModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    PaginatorComponent,
    AsyncPipe,
    TimeFormatPipe,
    CurrencyValuePipe,
    LangPipe,
  ],
})
export class TradeFeeComponent implements OnInit {
  constructor(
    public appService: AppService,
    private api: MemberApi,
    private activatedRoute: ActivatedRoute
  ) {}

  uid: any;
  isLoading = false;
  pageSizes: number[] = PageSizes; // 调整每页个数的数组
  paginator: PaginatorState = new PaginatorState(); // 分页

  list: any[] = []; // 列表数据

  ngOnInit() {
    // 获取 uid
    this.activatedRoute.queryParams.pipe().subscribe((v: any) => {
      this.uid = v.uid;
      this.loadData(true);
    });
  }

  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);
    this.loading(true);
    const parmas = {
      Uid: this.uid,
      Page: this.paginator.page,
      PageSize: this.paginator.pageSize,
    };
    this.api.getMemberHandlingFeeChangeList(parmas).subscribe((res) => {
      this.loading(false);
      if (res) {
        this.list = res?.list || [];
        this.paginator.total = res?.total || 0;
      }
    });
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }
}
