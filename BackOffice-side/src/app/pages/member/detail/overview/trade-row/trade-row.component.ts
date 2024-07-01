import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { MemberApi } from 'src/app/shared/api/member.api';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import moment from 'moment';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { WinDirective, WinColorDirective } from 'src/app/shared/directive/common.directive';
import { NgFor } from '@angular/common';

@Component({
  selector: 'overview-trade-row',
  templateUrl: './trade-row.component.html',
  host: {
    style: 'display: flex;',
  },
  standalone: true,
  imports: [NgFor, WinDirective, WinColorDirective, FormatMoneyPipe, CurrencyValuePipe, LangPipe],
})
export class TradeRowComponent implements OnInit, OnDestroy {
  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private api: MemberApi,
    private appService: AppService,
    private subHeader: SubHeaderService
  ) {
    const { uid } = this.route.snapshot.queryParams;
    this.uid = uid;
  }

  private _destroy$: any = new Subject<void>();
  uid!: string;
  isLoading = false;

  list: any[] = [];

  ngOnInit(): void {
    this.subHeader.timeCurrent$
      .pipe(takeUntil(this._destroy$)) // 销毁时取消订阅
      .subscribe(() => {
        this.loadData();
      });
  }

  loadData() {
    this.loading(true);
    const time = this.subHeader.curTime.length
      ? [moment(this.subHeader.curTime[0]).format('YYYY-MM-DD'), moment(this.subHeader.curTime[1]).format('YYYY-MM-DD')]
      : [];

    const params = { uid: this.uid, beginTime: time[0], endTime: time[1] };
    this.api.getMemberGameCategoryStat(params).subscribe((res) => {
      this.loading(false);
      this.list = Array.isArray(res) ? res : [];
    });
  }

  getTtileColor(i: any): any {
    const title: any = new Map([
      [0, '#009ef7'],
      [1, '#7e4aeb'],
      [2, '#df506e'],
      [3, '#f76c31'],
      [4, '#f73184'],
      [5, '#f7a831'],
    ]);
    return title.get(i) || title.get(0);
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
