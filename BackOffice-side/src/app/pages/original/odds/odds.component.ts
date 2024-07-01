import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { LotteryApi } from 'src/app/shared/api/lottery.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { Subject, takeUntil } from 'rxjs';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-odds',
  templateUrl: './odds.component.html',
  styleUrls: ['./odds.component.scss'],
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, AngularSvgIconModule, LangPipe],
})
export class OddsComponent implements OnInit {
  constructor(
    private appService: AppService,
    private api: LotteryApi,
    public subHeaderService: SubHeaderService
  ) {}

  _destroyed: any = new Subject<void>(); // 订阅商户的流

  isLoading = false;

  active = true;
  isEdit = false;

  // 表单搜索数据
  time: any = [new Date(), new Date()];
  // 游戏数据
  gameList: any = [];
  // 赔率数据
  data: any = {
    lotteryPlayConfigId: 5,
    lotteryName: '',
    lotteryMinAmount: 0,
    lotteryMaxQuota: 10000,
    lotterySingleMaxQuota: 20000000,
    thirdPartyCode: '1',
  };

  ngOnInit(): void {
    this.subHeaderService.merchantId$.pipe(takeUntil(this._destroyed)).subscribe(() => {
      this.loadData();
    });
  }

  loadData() {
    // 没有商户
    if (!this.subHeaderService.merchantCurrentId) return;
    this.loading(true);
    this.gameList = [];
    this.api.systemPlayGetLotteryName(this.subHeaderService.merchantCurrentId).subscribe((res) => {
      this.loading(false);
      res.data?.map((e) => {
        this.gameList.push(e);
      });

      this.active = this.gameList && this.gameList[0];
      this.getCurrentMethods();
    });
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  changeLimit() {
    if (!this.isEdit) return;
    this.api.updateOrignalPlayConfigById(this.data).subscribe((res) => {
      if (res.success) {
        this.appService.showToastSubject.next({
          msg: '修改成功',
          successed: true,
        });
        this.getCurrentMethods();
      } else {
        this.appService.showToastSubject.next({
          msg: '修改失败',
          successed: false,
        });
      }
    });
  }

  getCurrentMethods() {
    // 没有商户
    if (!this.subHeaderService.merchantCurrentId) return;
    this.loading(true);
    this.api.getOrignalOddsList(this.subHeaderService.merchantCurrentId, this.active).subscribe((res) => {
      this.data = res.data;
      this.loading(false);
    });
  }
}
