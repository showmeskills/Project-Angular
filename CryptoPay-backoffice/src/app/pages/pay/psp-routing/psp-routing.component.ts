import { Component, OnInit, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppService } from 'src/app/app.service';
import { ConfirmModalService } from 'src/app/shared/components/dialogs/confirm-modal/confirm-modal.service';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { DestroyService } from 'src/app/shared/models/tools.model';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PSPRuleService } from 'src/app/pages/pay/psp-routing/rule.service';
import { finalize, forkJoin, of, takeUntil } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { PSPApi } from 'src/app/shared/api/psp.api';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  conditionItem,
  kycLevelList,
  PSPConditionEnum,
  RuleEditComponent,
  timeUnitList,
} from 'src/app/pages/pay/psp-routing/rule-edit/rule-edit.component';
import { cloneDeep } from 'lodash';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { InputTrimDirective } from 'src/app/shared/directive/input.directive';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { PSPGroup, PSPRuleCondition, PSPRuleItem } from 'src/app/shared/interfaces/psp';
import { ChannelApi } from 'src/app/shared/api/channel.api';
import { PayChannelList, PaymentMethod } from 'src/app/shared/interfaces/channel';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { PaymentTypeEnum } from 'src/app/shared/interfaces/transaction';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { SelectApi } from 'src/app/shared/api/select.api';

@Component({
  selector: 'psp-routing',
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
    MatOptionModule,
    MatSelectModule,
  ],
  templateUrl: './psp-routing.component.html',
  styleUrls: ['./psp-routing.component.scss'],
  providers: [DestroyService],
})
export class PspRoutingComponent implements OnInit {
  constructor(
    private appService: AppService,
    private confirmModal: ConfirmModalService,
    private modalService: MatModal,
    private api: PSPApi,
    private subHeaderService: SubHeaderService,
    private destroyed$: DestroyService,
    public ruleService: PSPRuleService,
    private channelApi: ChannelApi,
    private selectApi: SelectApi,
    private lang: LangService
  ) {
    this.conditionList.forEach(async (e) => {
      e.lang = (await this.lang.getOne(e.lang)) || '-';
      e.children?.forEach(async (j) => {
        j.lang = (await this.lang.getOne(j.lang)) || '-';
      });
    });
  }

  searchGroupKW = '';
  nameControl = new FormControl('', [Validators.required]);

  loadingGroup = false;
  groupList: PSPGroup[] = [];
  channelList: PayChannelList[] = [];
  conditionList: conditionItem[] = this.ruleService.getConditionList();
  paymentMethodList: PaymentMethod[] = [];

  ngOnInit() {
    this.subHeaderService.merchantId$
      .pipe(takeUntil(this.destroyed$))
      .pipe(
        switchMap((merchantId) =>
          forkJoin([
            this.fetchGroup$(),
            this.channelApi.getSubChannelListByDetail({ merchantId }),
            this.selectApi.goMoneyGetPaymentMethods(),
          ])
        )
      )
      .subscribe(([, channelList, paymentMethodList]) => {
        this.channelList = channelList;
        this.paymentMethodList = paymentMethodList;
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

  selGroupFn(): void {
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
    return this.groupList.filter((e) => e.groupNameLocal?.includes(this.searchGroupKW));
  }

  get curGroupData() {
    return this.groupList.find((e) => e.id === this.ruleService.curGroupId);
  }

  /**
   * 删除分组
   */
  async onDelGroup(event: MouseEvent, group: PSPGroup) {
    event.stopPropagation();
    event.preventDefault();

    if (await this.confirmModal.open({ msgLang: 'form.isDelete' }).result) {
      this.appService.isContentLoadingSubject.next(true);
      this.api.delConfigGroup(this.subHeaderService.merchantCurrentId, group.id).subscribe((res) => {
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
  onEditGroup(editGroupTpl: TemplateRef<any>, event?: MouseEvent, group?: PSPGroup) {
    this.nameControl.reset();
    event?.stopPropagation();
    event?.preventDefault();
    group ? this.nameControl.setValue(group?.groupNameLocal || '') : this.nameControl.reset();

    this.modalService.open(editGroupTpl, { data: group, disableClose: true, width: '500px' });
  }

  /**
   * 选择分组
   */
  onSelGroup(group: PSPGroup) {
    this.ruleService.curGroupId = group.id;
  }

  /**
   * 更新分组
   */
  onGroupUpdate(close: () => void, updateData?: PSPGroup) {
    if (this.nameControl.invalid) return;

    this.appService.isContentLoadingSubject.next(true);
    if (updateData) {
      this.api
        .updateConfigGroup({
          ...updateData,
          groupNameLocal: this.nameControl.getRawValue()!,
          merchantId: this.subHeaderService.merchantCurrentId,
        })
        .pipe(finalize(() => this.appService.isContentLoadingSubject.next(false)))
        .subscribe((res) => {
          this.appService.toastOpera(res === true);
          res === true && this.fetchGroup$().subscribe();
          res && close();
        });
    } else {
      this.api
        .addConfigGroup({
          merchantId: +this.subHeaderService.merchantCurrentId,
          groupNameLocal: this.nameControl.getRawValue()!,
          sort: this.groupList.length + 1,
        })
        .pipe(finalize(() => this.appService.isContentLoadingSubject.next(false)))
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

    moveItemInArray(this.groupList, event.previousIndex, event.currentIndex);

    this.api
      .sortConfigGroup(
        this.subHeaderService.merchantCurrentId,
        this.groupList[event.currentIndex].id,
        event.currentIndex + 1
      )
      .pipe(
        finalize(() => (this.loadingGroup = false)),
        catchError(() => {
          // 拖拽失败还原排序
          this.fetchGroup$()
            .pipe(catchError(() => of(null)))
            .subscribe();
          return of(false);
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
  async onDelRule(event: Event, item: PSPRuleItem) {
    event.stopPropagation();

    if (await this.confirmModal.open({ msgLang: 'form.isDelete' }).result) {
      this.api.delStrategy(this.subHeaderService.merchantCurrentId, item.groupId, item.id).subscribe((res) => {
        res === true && this.ruleService.loadRules();
        this.appService.toastOpera(res === true);
      });
    }
  }

  /**
   * 克隆或编辑规则
   */
  async onCloneEditRule(event: Event, rule: PSPRuleItem, i: number, isClone = false) {
    event.stopPropagation();
    const num = isClone ? this.ruleService.rules.length + 1 : i + 1;

    this.appService.isContentLoadingSubject.next(true);
    this.api
      .getStrategyDetail(this.subHeaderService.merchantCurrentId, rule.groupId, rule.id)
      .subscribe(async (data) => {
        this.appService.isContentLoadingSubject.next(false);
        isClone && (data.id = 0);

        const res = this.modalService.open(RuleEditComponent, {
          width: '920px',
          disableClose: true,
        });
        res.componentInstance.subChannelList = cloneDeep(this.channelList);
        res.componentInstance.num = num;
        res.componentInstance.setData(data);

        if ((await res.result) !== true) return;
        this.ruleService.loadRules();
      });
  }

  /**
   * 打开添加规则弹窗
   */
  async openAddRule() {
    const res = await this.modalService.open(RuleEditComponent, { width: '800px', disableClose: true });
    res.componentInstance.num = this.ruleService.rules.length + 1;
    res.componentInstance.subChannelList = cloneDeep(this.channelList);

    if ((await res.result) !== true) return;
    this.ruleService.loadRules();
  }

  /**
   * 拖拽规则
   */
  onRuleDrop(event: CdkDragDrop<typeof this.ruleService.rules, any>) {
    if (event.previousIndex === event.currentIndex) return;

    moveItemInArray(this.ruleService.rules, event.previousIndex, event.currentIndex);
    this.api
      .updateStrategySort({
        merchantId: +this.subHeaderService.merchantCurrentId,
        id: event.item.data.id,
        groupId: this.ruleService.curGroupId,
        sort: event.currentIndex + 1,
      })
      .pipe(
        catchError(() => {
          // 拖拽失败还原排序
          this.fetchGroup$()
            .pipe(catchError(() => of(null)))
            .subscribe();
          return of(false);
        })
      )
      .subscribe((res) => {
        this.appService.toastOpera(res === true);
        this.ruleService.loadRules();
      });
  }

  /**
   * @description 更新规则字段
   * @param item
   * @param field
   * @param value
   */

  onUpdateField<T extends Object, K extends keyof T>(item: T, field: K, value: T[K]) {
    item[field] = value;
    this.ruleService.editRule$(item as any).subscribe();
  }

  /**
   * 生成当前条件遍历数组
   */
  generateConditionKey<T extends PSPRuleCondition, EK extends readonly (keyof T)[]>(
    rule: T,
    excludeKeys?: EK
  ): (keyof T)[] {
    return (Object.keys(rule || {}) as (keyof T)[])
      .filter((e) => rule[e] !== null)
      .filter((key: keyof T): key is Exclude<keyof T, EK[number]> => (excludeKeys ? !excludeKeys.includes(key) : true));
  }

  /**
   * 生成当前条件遍历数组
   */
  getSelectCondition<T extends PSPRuleCondition, EK extends readonly (keyof T)[]>(
    rule: T,
    excludeKeys?: EK
  ): conditionItem[] {
    return this.generateConditionKey(rule, excludeKeys)
      .map((key: any) => {
        const res = this.ruleService.getConditionNode(key as PSPConditionEnum);
        // if (!res) console.error(`未找到 ${key} 对应的条件节点`);
        return res;
      })
      .filter((e): e is conditionItem => !!e);
  }

  /**
   * 获取子渠道名称
   */
  getSubChannelName(channelAccountId: string) {
    return this.channelList.find((e) => e.channelAccountId === channelAccountId);
  }

  protected readonly Object = Object;
  protected readonly timeUnitList = timeUnitList;
  protected readonly kycLevelList = kycLevelList;
  protected readonly PSPConditionEnum = PSPConditionEnum;
  protected readonly PaymentTypeEnum = PaymentTypeEnum;
}
