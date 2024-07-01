import { Component, OnInit, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { AppService } from 'src/app/app.service';
import { ConfirmModalService } from 'src/app/shared/components/dialogs/confirm-modal/confirm-modal.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { InputTrimDirective } from 'src/app/shared/directive/input.directive';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { WithdrawalsApi } from 'src/app/shared/api/withdrawals.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import {
  kycLevelList,
  NgrComparisonEnum,
  ngrComparisonList,
  operationList,
  operationMethodList,
  RuleEditComponent,
  timeUnitList,
} from 'src/app/pages/finance/withdrawals/withdrawals-config/rule-edit/rule-edit.component';
import { catchError, switchMap, takeUntil, tap } from 'rxjs/operators';
import { DestroyService } from 'src/app/shared/models/tools.model';
import { combineLatestWith, finalize, of } from 'rxjs';
import { WithdrawalConfigGroup, WithdrawalStrategyResponse } from 'src/app/shared/interfaces/withdrawals';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';
import { RuleService } from 'src/app/pages/finance/withdrawals/withdrawals-config/rule.service';
import { cloneDeep } from 'lodash';
import { RiskApi } from 'src/app/shared/api/risk.api';
import { RiskLevelItem } from 'src/app/shared/interfaces/risk';

@Component({
  selector: 'withdrawals-config',
  standalone: true,
  imports: [
    CommonModule,
    MatExpansionModule,
    AngularSvgIconModule,
    LangPipe,
    ModalTitleComponent,
    FormRowComponent,
    InputTrimDirective,
    ReactiveFormsModule,
    ModalFooterComponent,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    FormsModule,
    LabelComponent,
    EmptyComponent,
    LoadingDirective,
  ],
  templateUrl: './withdrawals-config.component.html',
  styleUrls: ['./withdrawals-config.component.scss'],
  providers: [DestroyService],
})
export class WithdrawalsConfigComponent implements OnInit {
  constructor(
    private appService: AppService,
    private confirmModal: ConfirmModalService,
    private modalService: MatModal,
    private api: WithdrawalsApi,
    private subHeaderService: SubHeaderService,
    private destroyed$: DestroyService,
    public ruleService: RuleService,
    private riskApi: RiskApi
  ) {}

  searchGroupKW = '';
  nameControl = new FormControl('', [Validators.required]);

  loadingGroup = false;
  groupList: WithdrawalConfigGroup[] = [];
  riskLevelList: RiskLevelItem[] = [];

  ngOnInit() {
    this.subHeaderService.merchantId$.pipe(takeUntil(this.destroyed$)).subscribe((id) => {
      of(id)
        .pipe(
          combineLatestWith(
            this.fetchGroup$(),
            this.riskApi.getRiskControlSelect(this.subHeaderService.merchantCurrentId)
          )
        )
        .subscribe(([, , riskList]) => {
          this.riskLevelList = riskList;
        });
    });
  }

  /**
   * 拉取商户下分组
   */
  fetchGroup$() {
    return of(null).pipe(
      tap(() => (this.loadingGroup = true)),
      switchMap(() =>
        this.api.getConfigGroupList(this.subHeaderService.merchantCurrentId).pipe(
          finalize(() => (this.loadingGroup = false)),
          tap((groupList) => {
            this.groupList = groupList;

            this.selGroupFn();
          })
        )
      )
    );
  }

  selGroupFn() {
    // 如果是当前分组重新拉取，还存在则不变，不存在则默认第一个
    if (this.ruleService.curGroupId && this.groupList?.some((e) => e.id === this.ruleService.curGroupId)) return;
    if (!this.groupList?.length) return (this.ruleService.curGroupId = 0), void 0;

    this.ruleService.curGroupId = this.groupList[0]?.id || 0;
  }

  /**
   * 是否打开分组
   */
  get isShowGroupRule() {
    return !!this.groupList.length && !!this.curGroupData;
  }

  /**
   * 搜索分组
   */
  get renderGroupList() {
    return this.groupList.filter((e) => e.groupName.includes(this.searchGroupKW));
  }

  get curGroupData() {
    return this.groupList.find((e) => e.id === this.ruleService.curGroupId);
  }

  /**
   * 删除分组
   */
  async onDelGroup(event: MouseEvent, group: WithdrawalConfigGroup) {
    event.stopPropagation();
    event.preventDefault();

    if (await this.confirmModal.open({ msgLang: 'form.isDelete' }).result) {
      this.appService.isContentLoadingSubject.next(true);
      this.api.delConfigGroup(group.tenantId, group.id).subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);
        this.appService.toastOpera(res === true);
        if (res !== true) return;

        this.fetchGroup$().subscribe();
        close();
      });
    }
  }

  /**
   * 编辑分组(通过group参数传递，如果没有则为新增)
   */
  onEditGroup(editGroupTpl: TemplateRef<any>, event?: MouseEvent, group?: WithdrawalConfigGroup) {
    this.nameControl.reset();
    event?.stopPropagation();
    event?.preventDefault();
    group ? this.nameControl.setValue(group?.groupName || '') : this.nameControl.reset();

    this.modalService.open(editGroupTpl, { data: group, disableClose: true, width: '500px' });
  }

  /**
   * 选择分组
   */
  onSelGroup(group: WithdrawalConfigGroup) {
    this.ruleService.curGroupId = group.id;
  }

  /**
   * 更新分组
   */
  onGroupUpdate(close: () => void, updateData?: WithdrawalConfigGroup) {
    if (this.nameControl.invalid) return;

    if (updateData) {
      this.api.updateConfigGroup({ ...updateData, groupName: this.nameControl.getRawValue()! }).subscribe((res) => {
        this.appService.toastOpera(res === true);
        res === true && this.fetchGroup$().subscribe();
        res && close();
      });
    } else {
      this.api
        .addConfigGroup({
          tenantId: +this.subHeaderService.merchantCurrentId,
          groupName: this.nameControl.getRawValue()!,
        })
        .subscribe((res) => {
          this.appService.toastOpera(res === true);
          res === true && this.fetchGroup$().subscribe();
          res && close();
        });
    }
  }

  /**
   * 排序分组
   * @param event
   */
  onDrop(event: CdkDragDrop<typeof this.groupList, any>) {
    if (event.previousIndex === event.currentIndex) return;

    // 交换排序值
    const prev = this.groupList[event.previousIndex];
    const cur = this.groupList[event.currentIndex];
    const temp = prev.priority;
    prev.priority = cur.priority;
    cur.priority = temp;

    moveItemInArray(this.groupList, event.previousIndex, event.currentIndex);

    this.api
      .sortConfigGroup(this.subHeaderService.merchantCurrentId, [
        { ...prev, groupId: prev.id },
        { ...cur, groupId: cur.id },
      ])
      .pipe(
        finalize(() => (this.loadingGroup = false)),
        catchError((err, caught) => {
          // 拖拽失败还原排序
          this.fetchGroup$().subscribe();
          return caught;
        })
      )
      .subscribe((res) => {
        this.appService.toastOpera(res === true);
        this.fetchGroup$().subscribe();
      });
  }

  /**
   * 删除规则
   */
  async onDelRule(event: Event, i: number) {
    event.stopPropagation();

    if (await this.confirmModal.open({ msgLang: 'form.isDelete' }).result) {
      this.ruleService.remove(i);
    }
  }

  /**
   * 克隆编辑规则
   */
  async onCloneEditRule(event: Event, rule: WithdrawalStrategyResponse, i: number, isClone = false) {
    event.stopPropagation();
    const num = isClone ? this.ruleService.rules.length + 1 : i + 1;

    const res = await this.modalService.open(RuleEditComponent, {
      width: '800px',
      disableClose: true,
    });
    res.componentInstance.num = num;
    res.componentInstance.riskLevelList = this.riskLevelList;
    res.componentInstance.setData(cloneDeep(rule), num - 1);

    if ((await res.result) !== true) return;
    this.ruleService.loadRules();
  }

  /**
   * 打开添加规则弹窗
   */
  async openAddRule() {
    const res = await this.modalService.open(RuleEditComponent, { width: '800px', disableClose: true });
    res.componentInstance.num = this.ruleService.rules.length + 1;
    res.componentInstance.riskLevelList = this.riskLevelList;

    if ((await res.result) !== true) return;
    this.ruleService.loadRules();
  }

  onRuleDrop(event: CdkDragDrop<typeof this.ruleService.rules, any>) {
    if (event.previousIndex === event.currentIndex) return;

    moveItemInArray(this.ruleService.rules, event.previousIndex, event.currentIndex);
    this.ruleService.updateRule(true);
  }

  protected readonly Object = Object;
  protected readonly timeUnitList = timeUnitList;
  protected readonly kycLevelList = kycLevelList;
  protected readonly operationList = operationList;
  protected readonly operationMethodList = operationMethodList;

  /**
   * @description 更新规则字段
   * @param item
   * @param field
   * @param value
   */

  onUpdateField<T extends Object, K extends keyof T>(item: T, field: K, value: T[K]) {
    item[field] = value;
    this.ruleService.updateRule();
  }

  protected readonly ngrComparisonList = ngrComparisonList;
  protected readonly NgrComparisonEnum = NgrComparisonEnum;
}
