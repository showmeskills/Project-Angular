import { Location } from '@angular/common';
import { Component, OnInit, Optional } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import moment, { Moment } from 'moment';
import { FriendApi } from 'src/app/shared/apis/friend.api';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { NativeAppService } from 'src/app/shared/service/native-app.service';

@UntilDestroy()
@Component({
  selector: 'app-web-rank-pop-up',
  templateUrl: './web-rank-pop-up.component.html',
  styleUrls: ['./web-rank-pop-up.component.scss'],
})
export class WebRankPopUpComponent implements OnInit {
  constructor(
    private layout: LayoutService,
    public router: Router,
    public location: Location,
    @Optional() private dialogRef: MatDialogRef<WebRankPopUpComponent>,
    private friendApi: FriendApi,
    private localeService: LocaleService,
    private nativeAppService: NativeAppService,
  ) {}

  isH5!: boolean;

  /** 选择日期 */
  selectedDate!: Moment | any;

  /**  头部按钮*/
  topBtnList: string[] = [this.localeService.getValue('rank_g'), this.localeService.getValue('rank_h')];

  /** 激活按钮下标 */
  isActiveBtnIdx: number = 0;

  /** 确定当前选择的 哪个类型api*/
  currentDate: string = '';

  /** 加载动画 */
  loading: boolean = false;

  /** 分页数据 */
  // paginator: PaginatorState = {
  //   page: 1,
  //   pageSize: 10,
  //   total: 0
  // };

  /**@rankList 排名数组 */
  rankList: any[] = [];

  ngOnInit(): void {
    this.nativeAppService.setNativeTitle('rank_e');
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    this.getDefaultData(0);
  }

  /**
   *  加载默认昨天数据数据
   *
   * @param idx 下标
   * @param resetPaginator 是否重置页码
   */
  getDefaultData(idx: number, resetPaginator: boolean = true) {
    this.rankList = [];
    this.loading = true;
    if (resetPaginator) {
      this.onResetPaginator();
    }

    const params = {
      page: 1,
      pageSize: 100,
      day: '' as any,
    };
    switch (idx) {
      case 0:
        this.isActiveBtnIdx = idx;
        params.day = moment().format('YYYY-MM-DD');
        this.friendApi.getCommissionTopReal(params).subscribe(data => {
          this.loading = false;
          this.rankList = data.list;
          //this.paginator.total = data.total;
        });
        return;
      case 1:
        this.isActiveBtnIdx = idx;
        params.day = moment().subtract(1, 'day').format('YYYY-MM-DD');
        this.friendApi.getCommissionTopYesterday(params).subscribe(data => {
          this.loading = false;
          this.rankList = data.list;
          //this.paginator.total = data.total;
        });
        return;
    }
  }

  /**@onResetPaginator 切换日期重置分页 */
  onResetPaginator() {
    // this.paginator = {
    //   page: 1,
    //   pageSize: 10,
    //   total: 0
    // };
  }

  close() {
    this.dialogRef.close();
  }
}
