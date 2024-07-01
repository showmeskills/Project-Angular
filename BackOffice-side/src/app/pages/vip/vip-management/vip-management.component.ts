import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { VipApi } from 'src/app/shared/api/vip.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { WelfareComponent } from './welfare/welfare.component';
import { WelfareCountComponent } from './welfare-count/welfare-count.component';
import { LevelSettingComponent } from './level-setting/level-setting.component';
import { RecentlyChangesComponent } from './recently-changes/recently-changes.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgIf, NgFor, NgClass } from '@angular/common';
@Component({
  selector: 'app-vip-management-model-a',
  templateUrl: './vip-management.component.html',
  styleUrls: ['./vip-management.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    AngularSvgIconModule,
    RecentlyChangesComponent,
    LevelSettingComponent,
    WelfareCountComponent,
    WelfareComponent,
    FormatMoneyPipe,
    LangPipe,
  ],
})
export class VipManagementComponent implements OnInit, OnDestroy {
  _destroyed: any = new Subject<void>(); // 订阅商户的流

  constructor(
    private vipApi: VipApi,
    private appService: AppService,
    private subHeaderService: SubHeaderService
  ) {}

  isLoading = false;

  images = [
    '../../../assets/images/countries.png',
    '../../../assets/images/countries.png',
    '../../../assets/images/countries.png',
  ];

  list: any = []; // 总数据
  userDetialAll: any = {}; // 查询人数vip 全部统计
  userDetialSvip: any = {}; // 查询人数vip 0 -10 各个统计
  userDetialList: any = []; // 查询人数vip SVIP 统计

  ngOnInit() {
    this.subHeaderService.merchantId$.pipe(takeUntil(this._destroyed)).subscribe(() => {
      // 没有商户
      if (!this.subHeaderService.merchantCurrentId) return;
      this.loadData();
    });
  }

  loadData() {
    this.loading(true);
    forkJoin([this.vipApi.getUserDetailsList(this.subHeaderService.merchantCurrentId)]).subscribe(([res]) => {
      this.loading(false);
      this.list = res?.data || [];
      if (this.list.length > 0) {
        this.userDetialList = res?.data?.slice(0, -2) || [];
        this.userDetialSvip = res?.data[res.data?.length - 2] || {};
        this.userDetialAll = res?.data[res.data?.length - 1] || {};
      }
    });
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }
}
