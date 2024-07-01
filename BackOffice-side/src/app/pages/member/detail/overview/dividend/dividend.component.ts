import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { MemberApi } from 'src/app/shared/api/member.api';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { takeUntil } from 'rxjs';
import { DestroyService } from 'src/app/shared/models/tools.model';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'dividend',
  templateUrl: './dividend.component.html',
  styleUrls: ['./dividend.component.scss'],
  providers: [DestroyService],
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    CurrencyIconDirective,
    LabelComponent,
    AngularSvgIconModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    PaginatorComponent,
    TimeFormatPipe,
    CurrencyValuePipe,
    LangPipe,
  ],
})
export class DividendComponent implements OnInit {
  constructor(
    private appService: AppService,
    private route: ActivatedRoute,
    private api: MemberApi,
    private _destroy$: DestroyService
  ) {}

  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  isLoading = false; // 是否处于加载
  uid!: string;
  bonusList: any[] = [];

  typeList = [
    { name: '全部', value: 0, lang: 'common.all' },
    { name: '待领取', value: 1, lang: 'member.detail.discount.await' },
    { name: '已领取', value: 2, lang: 'member.detail.discount.received' },
  ];

  prizeTypeList: any[] = [
    { name: '现金券', lang: 'member.activity.prizeCommon.configurationList.cashCoupon', value: 'Cash' },
    { name: '抵用金', lang: 'member.activity.prizeCommon.configurationList.credit', value: 'Coupon' },
    {
      name: '后发现金券',
      lang: 'member.activity.prizeCommon.configurationList.goldCouponsLater',
      value: 'Later',
    },
    { name: '实物', lang: 'member.activity.prizeCommon.configurationList.realObject', value: 'InKind' },
    { name: '装备', lang: 'member.activity.prizeCommon.configurationList.equipment', value: 'Equip' },
    { name: 'Free Spin', lang: 'member.activity.prizeCommon.configurationList.freespin', value: 'FreeSpin' },
    {
      name: 'SVIP体验券',
      lang: 'member.activity.prizeCommon.configurationList.svipExperienceCoupon',
      value: 'SVIP',
    },
  ];

  activeType = this.typeList[0].value;

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this._destroy$)).subscribe((v: any) => {
      this.uid = v.uid;
      if (this.uid != undefined) this.loadData(true);
    });
  }

  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);
    this.loading(true);
    this.api
      .getBonusGrantList({
        uid: this.uid,
        status: this.activeType,
        pageIndex: this.paginator.page,
        pageSize: this.paginator.pageSize,
      })
      .subscribe((data) => {
        this.loading(false);

        this.bonusList = data.list;
        this.paginator.total = data.total;
      });
  }

  getTypeText(type: any) {
    if (type) return this.prizeTypeList.find((v) => v.value === type)['lang'];
    return 'common.unknown';
  }

  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  onType(value: number) {
    this.activeType = value;
    this.loadData(true);
  }
}
