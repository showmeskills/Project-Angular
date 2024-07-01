import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import moment from 'moment';
import { map } from 'rxjs/operators';
import { AffiliateApi } from 'src/app/shared/apis/affiliate.api';
import { GameApi } from 'src/app/shared/apis/game.api';
import { PaginatorState } from 'src/app/shared/components/paginator/paginator.module';
import { GameProvider, TableHader, TransList } from 'src/app/shared/interfaces/affiliate.interface';
import { GeneralService } from 'src/app/shared/service/general.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';

@UntilDestroy()
@Component({
  selector: 'app-game-record',
  templateUrl: './game-record.component.html',
  styleUrls: ['./game-record.component.scss'],
})
export class GameRecordComponent implements OnInit {
  constructor(
    private layout: LayoutService,
    private affiliateApi: AffiliateApi,
    private localeService: LocaleService,
    private generalService: GeneralService,
    private gameApi: GameApi,
  ) {}

  isH5!: boolean;

  /** 表头文字 */
  tableHead: TableHader[] = [
    { headTitle: this.localeService.getValue('degrade_uid') },
    { headTitle: this.localeService.getValue('venue') },
    { headTitle: this.localeService.getValue('gname') },
    { headTitle: this.localeService.getValue('betting_money') },
    { headTitle: this.localeService.getValue('active_betting') },
    { headTitle: this.localeService.getValue('status') },
    { headTitle: this.localeService.getValue('pay_reward') },
    { headTitle: this.localeService.getValue('betting_time'), icon: 'icon-arrow-down' },
  ];

  data: any = {
    uid: '',
    providerCode: '',
    status: '',
    betBeginTime: moment(this.generalService.getStartEndDateArray('7days')[0]),
    betEndTime: moment(this.generalService.getStartEndDateArray('7days')[1]),
  };

  gameTransList: TransList[] = [];

  /** 设备列表分页信息 */
  paginator: PaginatorState = {
    page: 1,
    pageSize: 10,
    total: 0,
  };

  /** 状态选择 */
  statusOptions = [
    { key: this.localeService.getValue('all'), value: '' },
    { key: this.localeService.getValue('unsettlement'), value: 0 },
    { key: this.localeService.getValue('settlemented'), value: 1 },
  ];

  loading: boolean = false;

  /** loading for game provider drop */
  providerLoading: boolean = false;

  /** 所有游戏厂商 */
  gameProvider: GameProvider[] = [{ providerName: this.localeService.getValue('all'), providerCode: '' }];

  /** 限定最多三个月 */
  get betMaxDate() {
    if (this.data.betBeginTime) {
      return moment(this.data.betBeginTime).add(89, 'days');
    }
    return undefined;
  }

  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    this.getGameProviderList();
    this.loadData();
  }

  /**
   * 初始加载数据
   *
   * @param paginator 页脚参数
   */
  loadData(paginator?: any) {
    if (paginator) {
      this.paginator.page = paginator.page;
      this.paginator.pageSize = paginator.pageSize;
    }
    this.loading = true;
    const params = {
      uid: this.data.uid,
      providerCode: this.data.providerCode,
      status: this.data.status,
      betBeginTime: moment(this.data.betBeginTime).startOf('day').valueOf(),
      betEndTime: moment(this.data.betEndTime).add(1, 'd').startOf('day').valueOf(),
      page: this.paginator.page,
      pageSize: this.paginator.pageSize,
    };

    this.affiliateApi.getGameTransList(params).subscribe((data: any) => {
      this.loading = false;
      this.gameTransList = data.list;
      this.paginator.total = data.total;
    });
  }

  /** 获取所有游戏厂商 */
  getGameProviderList() {
    this.providerLoading = true;
    this.gameApi
      .getProviderList()
      .pipe(
        untilDestroyed(this),
        map(x => {
          if (x?.data) {
            const list = x.data;
            return list.map(provider => {
              return {
                providerCode: provider?.providerCatId || '',
                providerName: provider?.providerName || '',
              };
            });
          }
          return [];
        }),
      )
      .subscribe(data => {
        this.providerLoading = false;
        this.gameProvider = [...this.gameProvider, ...data];
      });
  }

  /** 当时间参数是undefined 设置为0*/
  onClearDate() {
    for (const date in this.data) {
      if (this.data[date] === undefined) {
        this.data[date] = 0;
      }
    }
  }

  onReset(): void {
    this.data = {
      uid: '',
      providerCode: '',
      status: '',
      betBeginTime: moment(this.generalService.getStartEndDateArray('7days')[0]),
      betEndTime: moment(this.generalService.getStartEndDateArray('7days')[1]),
    };

    this.loadData();
  }
}
