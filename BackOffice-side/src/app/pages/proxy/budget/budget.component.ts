import { Component, OnInit } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { AppService } from 'src/app/app.service';
import { AgentApi } from 'src/app/shared/api/agent.api';
import { cloneDeep } from 'lodash';
import { Router } from '@angular/router';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { BudgetSelectComponent } from './budget-select/budget-select.component';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { NgIf, NgFor } from '@angular/common';
@Component({
  selector: 'budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    NgFor,
    MatOptionModule,
    BudgetSelectComponent,
    AngularSvgIconModule,
    PaginatorComponent,
    CurrencyValuePipe,
    LangPipe,
  ],
})
export class BudgetComponent implements OnInit {
  constructor(
    private modal: NgbModal,
    private api: AgentApi,
    private subHeader: SubHeaderService,
    private appService: AppService,
    private router: Router
  ) {}

  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  list: any[] = [];
  isLoading = false;
  edit = false;

  data: any = {};
  cache: any = {};
  team = 0;
  teamList: any[] = [];

  /** lifeCycle */
  ngOnInit(): void {
    // TODO test
    this.list = [{}, {}, {}, {}, {}, {}, {}];
    this.paginator.total = 1e2;

    this.appService.isContentLoadingSubject.next(true);
    this.api.getgrouplist().subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      if (!res?.length) return this.appService.showToastSubject.next({ msgLang: 'budget.noTeam' });

      this.team = res[0].id;
      this.teamList = res;
      this.loadBudget();
    });

    // this.loadBudget();
  }

  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);
  }

  loadBudget() {
    if (!this.team) return this.appService.showToastSubject.next({ msgLang: 'budget.chooseTeam' });

    this.api.getgroupuserquotalist(this.team).subscribe((res) => {
      this.data = res;
    });
  }

  setBudget(): void {
    if (!this.data?.quotaList?.length) return;

    this.appService.isContentLoadingSubject.next(true);
    this.api
      .setgroupuserarrayquota({
        groupId: this.team,
        quotaList: this.data.quotaList.map((e) => ({
          userId: e.userId,
          quota: e.quota,
        })),
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);

        if (res === true) {
          this.edit = false;
          this.loadBudget();
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

  readCache() {
    this.data = cloneDeep(this.cache);
  }

  saveCache() {
    this.cache = cloneDeep(this.data);
  }

  async openApply(): Promise<void> {
    // const modal = this.modal.open(ApprovalApplyComponent, {centered: true, windowClass: 'approval-apply-modal'});
    // modal.componentInstance.isEditTag = false; // 不可编辑标签
    this.router.navigate(['/proxy/budget-apply']);
  }

  onEdit() {
    this.saveCache();
    this.edit = !this.edit;
  }

  onAdd(item: any, addValue: number) {
    if (this.data.totalRest - addValue < 0) return this.appService.showToastSubject.next({ msg: '超出预算' });

    item.rest += addValue;
    item.quota += addValue;
    this.data.totalRest -= addValue;
  }
}
