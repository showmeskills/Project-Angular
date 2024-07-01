import { Component, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { VipApi } from 'src/app/shared/api/vip.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { DestroyService } from 'src/app/shared/models/tools.model';
import { cloneDeep } from 'lodash';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { FormsModule } from '@angular/forms';
import { VipPointsItem } from 'src/app/shared/interfaces/vip';

@Component({
  selector: 'app-level-setting',
  templateUrl: './level-setting.component.html',
  styleUrls: ['./level-setting.component.scss'],
  providers: [DestroyService],
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    AngularSvgIconModule,
    FormatMoneyPipe,
    LangPipe,
    LoadingDirective,
    EmptyComponent,
    CommonModule,
    FormsModule,
  ],
})
export class LevelSettingComponent implements OnInit {
  constructor(
    private vipApi: VipApi,
    private subHeaderService: SubHeaderService,
    private appService: AppService,
    private destroy$: DestroyService
  ) {}

  /** 是否处于加载 */
  vipPointsLoading = true;

  isGrowthEdit = false;

  growthList: VipPointsItem[] = [];
  growthEditList: VipPointsItem[] = [];

  ngOnInit() {
    this.subHeaderService.merchantId$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadData();
    });
  }

  loadData() {
    this.vipPointsLoading = true;
    this.vipApi.vipa_manage_points_list({}, this.subHeaderService.merchantCurrentId).subscribe((res) => {
      this.vipPointsLoading = false;

      this.growthList = res?.data || [];
    });
  }

  /** 成长值配置 - 编辑操作 */
  onGrowthValueEdit() {
    this.growthEditList = cloneDeep(this.growthList);
    this.isGrowthEdit = !this.isGrowthEdit;
  }

  /** 成长值配置 - 编辑确认 */
  growthEdit() {
    this.vipPointsLoading = true;
    const parmas = this.growthEditList.map((v) => ({
      pointsId: v.pointsId,
      dailyMaxPoints: v.dailyMaxPoints,
      points: v.points,
    }));
    this.vipApi.vipa_manage_points_batchupdateinfo(parmas, this.subHeaderService.merchantCurrentId).subscribe((res) => {
      this.vipPointsLoading = false;
      if (res?.code !== '0000') return this.appService.showToastSubject.next({ msg: res?.message });
      this.appService.showToastSubject.next({ msgLang: 'common.sucOperation', successed: true });
      this.isGrowthEdit = false;
      setTimeout(() => {
        this.loadData();
      }, 100);
    });
  }
}
