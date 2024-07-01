/* eslint-disable @angular-eslint/use-lifecycle-interface */
import { Component, OnInit } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { AppService } from 'src/app/app.service';
import { JSONToExcelDownload } from 'src/app/shared/models/tools.model';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MemberApi } from 'src/app/shared/api/member.api';
import moment from 'moment';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import {
  SelectChildrenDirective,
  SelectGroupDirective,
  SelectDirective,
} from 'src/app/shared/directive/select.directive';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgIf, NgFor } from '@angular/common';
@Component({
  selector: 'app-phone-query',
  templateUrl: './phone-query.component.html',
  styleUrls: ['./phone-query.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    AngularSvgIconModule,
    SelectChildrenDirective,
    SelectGroupDirective,
    NgFor,
    FormsModule,
    SelectDirective,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    PaginatorComponent,
    TimeFormatPipe,
    LangPipe,
  ],
})
export class PhoneQueryComponent implements OnInit {
  constructor(
    private appService: AppService,
    public subHeader: SubHeaderService,
    private api: MemberApi
  ) {}

  pageSizes: number[] = PageSizes; // 页大小
  merchantCurrentId = '1';
  countryCurrentCode = 'AO';
  uid = '';
  paginator: PaginatorState = new PaginatorState(); // 分页
  list: any = [];
  isLoading = false; // 是否加载中
  private _destroyed$ = new Subject<void>(); //销毁的监视者

  loadData(resetPage = false) {
    this.loading(true);
    resetPage && (this.paginator.page = 1);
    this.api
      .memberDepositMobile({
        Page: this.paginator.page,
        PageSize: this.paginator.pageSize,
      })
      .subscribe((res) => {
        this.loading(false);
        if (res.list.length) {
          this.list = res.list;
          this.paginator.total = res?.total || 0;
        }
      });
  }

  ngOnInit() {
    this.subHeader.merchantId$.pipe(takeUntil(this._destroyed$)).subscribe((res) => {
      this.merchantCurrentId = res;
    });
    this.subHeader.countryCode$.pipe(takeUntil(this._destroyed$)).subscribe((res) => {
      this.countryCurrentCode = res;
    });
    this.loadData();
  }

  ngOnDestroy(): void {
    this._destroyed$.next();
    this._destroyed$.complete();
  }

  // loading处理
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  onExport(): void {
    const curCheckedArr = this.list
      .filter((e) => e.checked)
      .map((e) => ({
        uid: e.uid,
        phone: e.mobile,
        time: moment(e.modifiedTime).format('YYYY-MM-DD HH:mm:ss'),
      }));

    if (!curCheckedArr.length) {
      return this.appService.showToastSubject.next({
        msgLang: 'common.tickExport',
        successed: false,
      });
    }

    this.list.forEach((e) => (e.checked = false));
    JSONToExcelDownload(curCheckedArr, 'phoneQuery-list ' + Date.now());
  }
}
