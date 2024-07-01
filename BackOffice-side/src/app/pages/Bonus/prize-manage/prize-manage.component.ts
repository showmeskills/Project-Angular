import { cloneDeep } from 'lodash';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { filter, takeUntil, zip } from 'rxjs';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { NavigationEnd, Router } from '@angular/router';
import { ActivityAPI } from 'src/app/shared/api/activity.api';
import { Prize, PrizeType, PrizeTypeItem } from 'src/app/shared/interfaces/activity';
import { PrizeService } from 'src/app/pages/Bonus/prize.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MatOptionModule } from '@angular/material/core';
import { NgFor, NgSwitch, NgSwitchCase, NgIf } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { DestroyService } from 'src/app/shared/models/tools.model';
import { PrizeConfigPipe } from 'src/app/pages/Bonus/bonus.service';

@Component({
  selector: 'app-prize-manage',
  templateUrl: './prize-manage.component.html',
  styleUrls: ['./prize-manage.component.scss'],
  providers: [DestroyService],
  standalone: true,
  imports: [
    FormRowComponent,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    NgFor,
    MatOptionModule,
    AngularSvgIconModule,
    NgSwitch,
    NgSwitchCase,
    LabelComponent,
    NgIf,
    PaginatorComponent,
    ModalTitleComponent,
    ModalFooterComponent,
    TimeFormatPipe,
    FormatMoneyPipe,
    LangPipe,
    PrizeConfigPipe,
  ],
})
export class PrizeManageComponent implements OnInit {
  constructor(
    private appService: AppService,
    public lang: LangService,
    private modalService: MatModal,
    public subHeaderService: SubHeaderService,
    public router: Router,
    public prizeService: PrizeService,
    private api: ActivityAPI,
    private destroy$: DestroyService
  ) {}

  modalRef;

  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  isLoading = false;
  prizeTypeList: PrizeTypeItem[] = [];

  dataEmpty = {
    title: '', // 名称
    type: 0, // 类型
  };

  data = cloneDeep(this.dataEmpty);

  list: Prize[] = [];

  get typeListCom() {
    return this.prizeService.typeList.filter((v) => ![PrizeType.SvipEXP].includes(v.value));
  }

  ngOnInit() {
    /**
     * 页面被释放缓存后，ngOnInit不会被执行
     * 1. 在路由器事件中完成列表数据的更新。
     * 2. 必须是匹配‘编辑’路由返回才进行列表的初始化，避免在未缓存时切换路由造成二次请求。
     */

    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        if (['prize-manage/edit', 'prize-manage/query'].includes(this.router.routeReuseStrategy['curr'])) {
          this.loadData();
        }
      });
    this.subHeaderService.merchantId$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      zip(this.api.prize_getprizetypes(this.subHeaderService.merchantCurrentId)).subscribe(([prizeType]) => {
        this.loading(false);
        this.prizeTypeList = [...(prizeType?.data || [])];

        this.loadData(true);
      });
      this.onReset();
    });
  }

  loadData(resetPage = false) {
    if (this.isLoading) return;

    resetPage && (this.paginator.page = 1);
    this.loading(true);
    const parmas = {
      merchantId: this.subHeaderService.merchantCurrentId,
      prizeName: this.data.title,
      prizeType: this.data.type,
      lang: this.lang.isLocal ? 'zh-cn' : 'en-us',
      pageIndex: this.paginator.page,
      pageSize: this.paginator.pageSize,
    };
    this.api.prize_getprizes(parmas).subscribe((res) => {
      this.loading(false);
      if (res?.success) {
        this.list = res?.data?.prizes || [];
        this.paginator.total = res?.data?.totalCount || 0;
      }
    });
  }

  onReset() {
    this.data = cloneDeep(this.dataEmpty);
    this.loadData(true);
  }

  goPrizeEdit(id?: number, type?: string) {
    this.router.navigate(['bonus/prize-manage/edit'], {
      queryParams: { tenantId: +this.subHeaderService.merchantCurrentId, id, type },
    });
    this.modalRef?.dismiss();
  }

  goPrizeQuery(item) {
    switch (item.prizeType) {
      case PrizeType.NonStickyBonus:
        this.router.navigate(['bonus/prize-manage/nonStickyBonus'], {
          queryParams: { prizeId: item?.id, tenantId: +this.subHeaderService.merchantCurrentId, type: 'prize' },
        });
        break;
      case PrizeType.FreeSpin:
        this.router.navigate(['bonus/prize-manage/free-spin-query'], {
          queryParams: { prizeId: item?.id, tenantId: +this.subHeaderService.merchantCurrentId },
        });
        break;
      default:
        this.router.navigate(['bonus/prize-manage/query'], {
          queryParams: { prizeId: item?.id, tenantId: +this.subHeaderService.merchantCurrentId },
        });
        break;
    }
  }

  async onOpenWarningPopup(tpl: TemplateRef<any>, type: string, id: number) {
    const prizeType: Map<string, any> = new Map([
      // name: '审核' msg:确认是否审核该奖品？ 审核后该奖品立即生效。
      [
        'review',
        { type: 'review', staus: 2, nameLang: 'member.coupon.review', msg: 'member.activity.prizeCommon.isOpenPrize' },
      ],
      // name: '下架' msg:确认是否下架该奖品？。
      [
        'down',
        { type: 'down', staus: 3, nameLang: 'member.coupon.offShelf', msg: 'member.activity.prizeCommon.isClosePrize' },
      ],
      // name: '上架' msg:确认是否上架该奖品？
      ['up', { type: 'up', staus: 4, nameLang: 'game.provider.up', msg: 'member.activity.prizeCommon.isUpPrize' }],
    ]);

    if (!prizeType.get(type)) return;

    const success = await this.lang.getOne('common.success'); // 成功
    const fail = await this.lang.getOne('common.fail'); // 失败
    const prize = await this.lang.getOne('luckRoulette.prize'); // 奖品
    const typeName = await this.lang.getOne(prizeType.get(type)?.nameLang); // 审核/下架/上架

    this.modalRef = this.modalService.open(tpl, {
      width: '540px',
      data: { ...prizeType.get(type), id },
      disableClose: true,
    });

    this.modalRef.result
      .then(() => {
        this.loading(true);
        const params = {
          merchantId: this.subHeaderService.merchantCurrentId,
          prizeId: id,
          staus: prizeType.get(type).staus,
        };
        this.api.prize_setstatus(params).subscribe((res) => {
          this.loading(false);
          if (res?.success) this.loadData();
          this.appService.showToastSubject.next({
            msg: res?.success ? `${prize}${typeName}${success}！` : res?.message || `${prize}${typeName}${fail}！`,
            successed: res?.success,
          });
        });
      })
      .catch(() => {});
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }
}
