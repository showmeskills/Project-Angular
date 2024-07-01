import { Component, OnInit } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { AppService } from 'src/app/app.service';
import { Router, ActivatedRoute } from '@angular/router';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { IconSrcDirective, CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { NgFor, NgSwitch, NgSwitchCase, NgSwitchDefault, NgIf, AsyncPipe } from '@angular/common';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { BreadcrumbsService } from 'src/app/_metronic/partials/layout/subheader/subheader1/breadcrumbs.service';
import { BonusInfo, NonStickyItem } from 'src/app/shared/interfaces/member.interface';
import { MemberApi } from 'src/app/shared/api/member.api';
import { ConfirmModalService } from 'src/app/shared/components/dialogs/confirm-modal/confirm-modal.service';
@Component({
  selector: 'app-non-sticky',
  templateUrl: './non-sticky.component.html',
  styleUrls: ['./non-sticky.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    NgSwitch,
    NgSwitchCase,
    IconSrcDirective,
    NgSwitchDefault,
    CurrencyIconDirective,
    NgIf,
    AngularSvgIconModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    PaginatorComponent,
    AsyncPipe,
    FormatMoneyPipe,
    CurrencyValuePipe,
    LangPipe,
    EmptyComponent,
    NgbPopover,
  ],
})
export class NonStickyComponent implements OnInit {
  constructor(
    public appService: AppService,
    public activatedRoute: ActivatedRoute,
    public router: Router,
    public lang: LangService,
    private breadcrumbsService: BreadcrumbsService,
    private api: MemberApi,
    private confirmModalService: ConfirmModalService
  ) {
    const { uid, id, tenantId } = activatedRoute.snapshot.queryParams; // params参数;
    this.id = id;
    this.uid = uid;
    this.tenantId = tenantId;
  }

  pageSizes: number[] = PageSizes; // 分页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  isLoading = false;
  type = 'Activated';
  id: string;
  uid: string;
  tenantId: string;
  list: NonStickyItem;
  bonusList = [
    'member.detail.nonsticky.withdrawable',
    'member.detail.nonsticky.lockBonus',
    'member.detail.nonsticky.casinoBonus',
    'member.detail.nonsticky.liveCasino',
  ];

  bonusBtns = [
    { lang: 'member.detail.nonsticky.activatedBonus', checked: true, type: 'Activated' },
    { lang: 'member.detail.nonsticky.qualifyBonus', checked: false, type: 'Pending' },
    // { lang: 'member.detail.nonsticky.pickUpRecord', checked: false, id: 3 },
    // { lang: 'member.detail.nonsticky.abandonRecord', checked: false, id: 4 },
  ];
  // bonusList = ['可提取的奖金', '锁定奖金', '娱乐场奖金', '真人娱乐城奖金'];
  // bonusBtns = ['激活的奖金', '符合的资格奖金', '领取记录', '放弃记录'];

  async ngOnInit() {
    await this.loadData(true);
    this.breadcrumbsService.setBefore([
      {
        name: '会员详情',
        lang: 'nav.memberDetail',
        click: () =>
          this.router.navigate(['/member/list/detail/overview'], {
            queryParams: { id: this.id, uid: this.uid, tenantId: this.tenantId },
          }),
      },
    ]);
  }

  async loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);
    const params = {
      uid: this.uid,
      status: this.type,
      PageIndex: this.paginator.page,
      PageSize: this.paginator.pageSize,
    };
    this.loading(true);
    this.api.getNonStickyInfo(params).subscribe((res) => {
      this.loading(false);
      if (res) {
        this.list = res;
        this.paginator.total = res?.total || 0;
      }
    });
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  toggleBonusType(selectedItem) {
    this.type = selectedItem.type;
    this.bonusBtns.forEach((item) => {
      item.checked = item.type === selectedItem.type;
    });
    this.loadData();
  }

  /**
   * 取消非粘性奖金
   */
  onCancelActive(item: BonusInfo) {
    this.confirmModalService.open({ msgLang: 'member.detail.nonsticky.abandonBonus' }).result.then((value) => {
      if (value !== true) return;

      this.appService.isContentLoadingSubject.next(true);
      this.api
        .cancelNonStickyBonus({ tenantId: +this.tenantId, bonusCode: item.bonusCode!, mid: +this.id })
        .subscribe((res: unknown) => {
          this.appService.isContentLoadingSubject.next(false);
          this.appService.toastOpera(res === true);
          res === true && this.loadData();
        });
    });
  }
}
