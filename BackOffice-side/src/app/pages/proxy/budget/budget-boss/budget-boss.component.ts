import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AgentApi } from 'src/app/shared/api/agent.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { filter, Subject, switchMap } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { BudgetSelectComponent } from '../budget-select/budget-select.component';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'budget',
  templateUrl: './budget-boss.component.html',
  styleUrls: ['../budget.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    NgFor,
    BudgetSelectComponent,
    AngularSvgIconModule,
    PaginatorComponent,
    CurrencyValuePipe,
    LangPipe,
  ],
})
export class BudgetBossComponent implements OnInit, OnDestroy {
  constructor(
    private modal: NgbModal,
    private api: AgentApi,
    private subHeader: SubHeaderService,
    private appService: AppService,
    private router: Router,
    private ls: LocalStorageService
  ) {}

  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  list: any[] = [];
  isLoading = false;
  edit = false;
  team = 0;
  teamList: any[] = [];
  data: any = {};

  _destroy$ = new Subject<void>();

  form: any = {};
  sendArr: any[] = [];
  managerList: any[] = [];

  /** getters */
  get curTeam() {
    return this.teamList.find((e) => e.groupId === this.team);
  }

  // 是否选择一个团队
  get isSelectTeam() {
    return !!this.curTeam;
  }

  // 剩余预算
  get total() {
    if (this.isSelectTeam) return this.curTeam?.quota;
    if (this.edit) return this.form.quota;

    return this.data.totalQuota;
  }

  // 当前遍历团队或经理
  get curList() {
    return this.edit ? this.sendArr : this.data.quotaList;
  }

  // 当前平台管理权限
  get isAdmin() {
    return this.ls.userInfo.isSuperAdmin; // 超级管理员
  }

  /** lifeCycle */
  ngOnInit(): void {
    // TODO test
    this.list = [{}, {}, {}, {}, {}, {}, {}];
    this.paginator.total = 1e2;

    this.subHeader.merchantId$
      .pipe(
        filter((e) => !!e),
        takeUntil(this._destroy$),
        switchMap(() => this.loadTeam())
      )
      .subscribe();

    this.subHeader.showMerchantList = this.isAdmin;
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this.subHeader.showMerchantList = true; // 恢复显示商户列表
  }

  /** methods */
  loadTeam() {
    this.team = 0;
    return this.api[this.isAdmin ? 'getgroupquotalist' : 'getcurrentgroupquotalist'](
      this.subHeader.merchantCurrentId
    ).pipe(
      tap((res) => {
        this.data = res;
        this.teamList = res?.quotaList || [];
      })
    );
  }

  loadData(): void {}

  setBudget(): void {
    this.appService.isContentLoadingSubject.next(true);
    this.api.setgrouparrayquota(this.sendArr.map((e) => ({ groupId: e.groupId, quota: e.quota }))).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      if (res === true) {
        this.edit = false;
        this.loadTeam().subscribe();
        this.appService.showToastSubject.next({
          msgLang: 'common.sucOperation',
          successed: true,
        });
      } else {
        this.appService.showToastSubject.next({
          msgLang: 'common.operationFailed',
          successed: false,
        });
      }
    });
  }

  async openApply(): Promise<void> {
    // const modal = this.modal.open(ApprovalApplyComponent, {centered: true, windowClass: 'approval-apply-modal'});
    // modal.componentInstance.isEditTag = false; // 不可编辑标签
    this.router.navigate(['/proxy/budget-apply']);
  }

  onAdd(item: any, addValue: number) {
    item.rest += addValue;
    item.quota += addValue;
    this.form.quota += addValue;
  }

  setForm() {
    // TODO :beer: 可优化代码
    this.form.quota = this.data.totalQuota;
    this.form.rest = this.data.totalRest;
    this.sendArr = this.teamList.map((e) => ({ ...e }));
  }

  onEdit() {
    this.setForm();
    this.edit = !this.edit;
  }

  onSelectTeam() {
    if (!this.curTeam?.groupId) return;

    this.api.getgroupuserquotalist(this.curTeam?.groupId).subscribe((res) => {
      this.managerList = res.quotaList;
    });
  }
}
