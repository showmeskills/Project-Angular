import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { lastValueFrom, zip } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { ActivityAPI } from 'src/app/shared/api/activity.api';
import { GameLabelApi } from 'src/app/shared/api/game-label.api';
import { GameApi } from 'src/app/shared/api/game.api';
import { SelectApi } from 'src/app/shared/api/select.api';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import {
  CurrencyIconDirective,
  IconCountryComponent,
  IconSrcDirective,
} from 'src/app/shared/components/icon/icon.directive';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { LangTabComponent } from 'src/app/shared/components/lang-tab/lang-tab.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';
import { SearchDirective, SearchInpDirective } from 'src/app/shared/directive/search.directive';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { HostPipe } from 'src/app/shared/pipes/common.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { TournamentLeaderboardPopupComponent } from './leaderboard-popup/leaderboard-popup.component';
import { finalize } from 'rxjs/operators';
import { JSONToExcelDownload } from 'src/app/shared/models/tools.model';

@Component({
  selector: 'app-tournament-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
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
    EmptyComponent,
    AngularSvgIconModule,
    LoadingDirective,
    LabelComponent,
    IconSrcDirective,
    IconCountryComponent,
    CurrencyValuePipe,
    CurrencyIconDirective,
    SearchDirective,
    SearchInpDirective,
    HostPipe,
    ModalTitleComponent,
    FormWrapComponent,
    ModalFooterComponent,
    ReactiveFormsModule,
    LangTabComponent,
    UploadComponent,
  ],
})
export class TournamentDetailComponent implements OnInit {
  constructor(
    public router: Router,
    public subHeaderService: SubHeaderService,
    private modalService: MatModal,
    private activatedRoute: ActivatedRoute,
    private appService: AppService,
    private fb: FormBuilder,
    private api: ActivityAPI,
    private gameLabelApi: GameLabelApi,
    public lang: LangService,
    private selectApi: SelectApi,
    private gameApi: GameApi
  ) {
    const { tenantId, activityId, tmpCode } = activatedRoute.snapshot.queryParams;
    this.tenantId = +tenantId;
    this.activityId = activityId;
    this.tmpCode = tmpCode;
  }

  /** 商户ID */
  tenantId;

  /**
   * 活动ID
   */
  activityId = '';

  /** 活动code */
  tmpCode;

  /** 活动详情 - 活动第一步数据 */
  stepOneInfo;
  thumbnailsImage = '';
  selectLang = ['zh-cn']; // PM:默认值CN
  formGroup = this.fb.group({
    lang: this.fb.array([
      this.fb.group({
        title: [''], // 标题
        subTitle: [''], // 副标题
        tc: [''], // T&C
        languageCode: ['zh-cn'],
      }),
    ]),
  });

  /** 活动详情 - 活动第二步数据 */
  stepTwoInfo;
  selectedLabelList: any[] = []; // 已选择的游戏标签
  selectedGameList: any[] = []; // 已选择的游戏
  selectCountryList: any[] = []; // 已选的国家
  memberManualRemark = ''; // 已选的会员UID
  criteriaList = [
    // 条件
    { name: '倍数', lang: 'Highest single win', value: 0 },
    { name: '投注总金额', lang: 'Total amount wagered', value: 1 },
    { name: '总旋转次数/总回合数', lang: 'Totalspins', value: 2 },
    { name: '总赢次数', lang: 'TotalWin', value: 3 },
  ];

  /** 参与游戏概况 - 页大小 */
  pageSizes: number[] = PageSizes;

  /** 参与游戏概况 - 分页 */
  paginator: PaginatorState = new PaginatorState();

  /** 参与游戏概况 - 国家code */
  countryCode = '';

  sortData = {
    order: '', // 排序字段
    isAsc: true, // 是否为升序排序
  };

  /** 参与游戏概况 - 列表数据 */
  list = [];

  ngOnInit() {
    this.subHeaderService.loadCountry(true);
    this.getActivityDetail();
    this.getQualifyingGamesList(true);
  }

  /** 活动详情 - 打开参与者排行榜 */
  onOpenLeaderboard() {
    const modalRef = this.modalService.open(TournamentLeaderboardPopupComponent, { width: '1000px', autoFocus: false });

    modalRef.componentInstance['activityId'] = this.activityId;
    modalRef.componentInstance['tmpCode'] = this.tmpCode;
    modalRef.componentInstance['tenantId'] = this.tenantId;
    modalRef.result.then(() => {}).catch(() => {});
  }

  /** 活动详情 - 获取详情 */
  getActivityDetail() {
    this.appService.isContentLoadingSubject.next(true);
    zip(
      this.api.activityDetailStep1(this.tmpCode, this.tenantId),
      this.api.newrank_get_steptwo(this.tmpCode, this.tenantId),
      this.selectApi.getCountry(),
      this.gameLabelApi.getList(this.tenantId)
    ).subscribe(([stepOneInfo, stepTwoInfo, countryList, gameLabelList]) => {
      this.appService.isContentLoadingSubject.next(false);

      /** 第一步 */
      this.stepOneInfo = stepOneInfo || {};
      if (stepOneInfo?.infoList?.length) {
        this.selectLang = stepOneInfo.infoList.map((e) => e.languageCode);
        this.formGroup.setControl(
          'lang',
          this.fb.array(
            stepOneInfo.infoList.map((e) =>
              this.fb.group({
                title: [e.name],
                subTitle: [e?.subName],
                tc: [e?.content],
                languageCode: [e?.languageCode],
              })
            )
          ) as any
        );
      }

      /** 第二步 */
      this.stepTwoInfo = stepTwoInfo?.data || {};
      // 游戏列表 - 标签列表
      if (this.stepTwoInfo?.labelIds && this.stepTwoInfo?.labelIds?.length && gameLabelList?.length) {
        this.selectedLabelList = gameLabelList.filter((v) => [...(this.stepTwoInfo?.labelIds || [])].includes(v.id));
      }
      // 游戏列表 - 游戏数据
      if (this.stepTwoInfo?.byGameTypes && this.stepTwoInfo?.byGameTypes?.length) {
        const gameIdsList = this.stepTwoInfo?.byGameTypes.map((v) => v?.gameId).filter((j) => j) || [];
        this.getgamelistbygameids(gameIdsList);
      }
      // 国家限制 - 获取国家
      if (this.stepTwoInfo?.countryType === 1 && this.stepTwoInfo?.countrys.length && countryList?.length) {
        this.selectCountryList = countryList
          .map((e) => e.countries.filter((j) => this.stepTwoInfo?.countrys?.includes(j.countryIso3)))
          .flat(Infinity);
      }
      // 玩家限制 - 获取UID
      if ([1, 2].includes(this.stepTwoInfo?.uidType)) {
        this.memberManualRemark = this.stepTwoInfo.uids?.users?.map((v) => v.uid).join(';') || '';
      }
    });
  }

  /** 活动详情 - 获取条件 */
  getCriteria(value) {
    return this.criteriaList.find((v) => v.value === value);
  }

  /** 活动详情 - 游戏列表：游戏ids获取游戏列表 */
  getgamelistbygameids(idsList: number[]) {
    const parmas = {
      tenantId: this.tenantId,
      ids: idsList,
    };
    this.appService.isContentLoadingSubject.next(true);
    this.gameApi.getgamelistbygameids(parmas).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      this.selectedGameList = res || [];
    });
  }

  /** 参与游戏概况 - 获取数据 */
  getQualifyingGamesList(resetPage = false) {
    this.appService.isContentLoadingSubject.next(true);
    this.getQualifyingGamesList$(resetPage)
      .pipe(finalize(() => this.appService.isContentLoadingSubject.next(false)))
      .subscribe((res) => {
        this.list = res?.data?.records || [];
        this.paginator.total = res?.data?.total || 0;
      });
  }

  getQualifyingGamesList$(resetPage = false, sendData?: Partial<any>) {
    resetPage && (this.paginator.page = 1);

    const parmas = {
      tenantId: this.tenantId,
      tmpCode: this.tmpCode,
      country: this.countryCode,
      pageIndex: this.paginator.page,
      pageSize: this.paginator.pageSize,
      ...sendData,
    };

    return this.api.getnewrankinjoingamelist(parmas);
  }

  /** 参与游戏概况 - 导出 */
  async onExport() {
    let list = [];

    try {
      this.appService.isContentLoadingSubject.next(true);
      const res = await lastValueFrom(this.getQualifyingGamesList$(true, { pageSize: 9e5 }));
      this.appService.isContentLoadingSubject.next(false);
      list = res?.data?.records || []; // success === false会自动抛出
    } finally {
      this.appService.isContentLoadingSubject.next(false);
    }

    if (!list.length) return this.appService.showToastSubject.next({ msgLang: 'common.emptyText' });

    const gameName = await this.lang.getOne('game.provider.game_name'); // 游戏名称
    const turnover = await this.lang.getOne('member.activity.sencli12.turnover'); // 流水
    const players = await this.lang.getOne('member.activity.sencli12.players'); // 参与玩家
    const spins = await this.lang.getOne('member.activity.sencli12.spins'); // 总旋转次数
    const ggr = 'GGR'; // 商户输赢

    const exportList = list.map((e: any) => ({
      [gameName]: e.gameName,
      [turnover + '（USDT）']: e.totalActiveFlowUsdt,
      [players]: e.joinNumber,
      [spins]: e.betTimes,
      [ggr + '（USDT）']: e.ggr,
    }));

    JSONToExcelDownload(exportList, 'leaderboard ' + Date.now());
  }

  /** 参与游戏概况 - 列表操作：表头字段排序 */
  onLabelThSort(sortKey) {
    if (!this.list.length) return;

    if (this.sortData.isAsc === false && this.sortData.order === sortKey) {
      this.sortData.order = '';
      this.sortData.isAsc = true;
      this.getQualifyingGamesList(true);
      return;
    }

    if (!this.sortData.order || this.sortData.order !== sortKey) {
      this.sortData.order = sortKey;
      this.sortData.isAsc = false;
    }

    this.sortData.isAsc = !this.sortData.isAsc;
    this.getQualifyingGamesList(true);
  }
}
