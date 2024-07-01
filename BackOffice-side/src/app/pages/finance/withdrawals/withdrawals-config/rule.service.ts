import { Injectable } from '@angular/core';
import {
  WithdrawalStrategyItem,
  WithdrawalStrategyParams,
  WithdrawalStrategyResponse,
} from 'src/app/shared/interfaces/withdrawals';
import { WithdrawalsApi } from 'src/app/shared/api/withdrawals.api';
import { finalize } from 'rxjs';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { AppService } from 'src/app/app.service';
import { cloneDeep } from 'lodash';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RuleService {
  constructor(
    private subHeaderService: SubHeaderService,
    private appService: AppService,
    private api: WithdrawalsApi
  ) {}

  /**
   * 当前选中的分组ID
   */
  private _curGroupId = 0;

  get curGroupId() {
    return this._curGroupId;
  }

  set curGroupId(val) {
    this._curGroupId = val;
    this.loadRules();
  }

  /**
   * 分组下的规则列表
   */
  rules: WithdrawalStrategyResponse[] = [];

  /**
   * @description 新增规则
   */
  addRule$(params: WithdrawalStrategyItem) {
    const rules = cloneDeep(this.rules);
    rules.push(params as WithdrawalStrategyResponse);

    return this.updateRule$(rules);
  }

  /**
   * @description 编辑规则
   */
  editRule$(params: WithdrawalStrategyItem, index: number) {
    const rules = cloneDeep(this.rules);
    rules.splice(index, 1, params as WithdrawalStrategyResponse);
    return this.updateRule$(rules);
  }

  /**
   * @description 更新规则
   */
  updateRule$(rules?: WithdrawalStrategyItem[]) {
    const withdrawalConfigItems = [
      ...(rules === undefined ? (cloneDeep(this.rules) as WithdrawalStrategyItem[]) : rules || []),
    ];

    // 赋默认值回去提交，不然后端解析参数会报错（Parker 2023-10-23）
    withdrawalConfigItems.forEach((e) => {
      e.withdrawalConditions.totalTime = +e.withdrawalConditions?.totalTime! || 0;
      e.withdrawalConditions.totalWithdrawalCount = +e.withdrawalConditions?.totalWithdrawalCount! || 0;
      e.withdrawalConditions.timeUnit = e.withdrawalConditions?.timeUnit! || 'Minute';
      e.withdrawalActions.delay = +e.withdrawalActions.delay || 0;
      e.withdrawalActions.timeUnit = e.withdrawalActions.timeUnit || 'Minute';
    });

    const sendData: WithdrawalStrategyParams = {
      tenantId: +this.subHeaderService.merchantCurrentId,
      groupId: this.curGroupId,
      withdrawalConfigItems,
    };

    this.ruleLoading = true;
    return this.api.updateStrategy(sendData).pipe(
      finalize(() => (this.ruleLoading = false)),
      tap((res) => {
        this.appService.toastOpera(res === true);
      })
    );
  }

  updateRule(loadRuleList?: boolean) {
    return this.updateRule$().subscribe((res) => {
      loadRuleList && res === true && this.loadRules();
    });
  }

  /**
   * @description 加载规则
   */
  ruleLoading = false;
  loadRules(): void {
    if (!this.curGroupId) {
      this.rules = [];
      return;
    }

    this.ruleLoading = true;
    this.api
      .getStrategyList(this.subHeaderService.merchantCurrentId, this.curGroupId)
      .pipe(
        map((res) => {
          res.forEach((e) => {
            // 如果接口默认值是0，前端不显示（没意义）
            Object.keys(e.withdrawalConditions || {}).forEach((actionKey) => {
              if (
                ['totalTime', 'totalWithdrawalCount'].includes(actionKey) &&
                ['', null, 0].includes(e.withdrawalConditions[actionKey])
              ) {
                e.withdrawalConditions[actionKey] = null;
                if (actionKey === 'totalTime') {
                  e.withdrawalConditions.timeUnit = null as any;
                }
              }
            });

            // 如果接口默认值是0，前端不显示（没意义）
            Object.keys(e.withdrawalActions || {}).forEach((actionKey) => {
              if (
                ['auditOperationMethod'].includes(actionKey) &&
                ['', null, 0].includes(e.withdrawalConditions[actionKey])
              ) {
                e.withdrawalConditions[actionKey] = null;
              }
            });

            // 如果是拒绝，清空审核方式、延迟时间、时间单位
            if (e.withdrawalActions.operation === 'NoApproved') {
              e.withdrawalActions.auditOperationMethod = null as any;
              e.withdrawalActions.delay = null as any;
              e.withdrawalActions.timeUnit = null as any;
            }
          });

          return res;
        }),
        finalize(() => {
          this.ruleLoading = false;
        })
      )
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);
        this.rules = res;
      });
  }

  /**
   * @description 删除规则
   * @param i
   */
  remove(i: any) {
    this.rules.splice(i, 1);
    this.updateRule();
  }

  /**
   * 切换显示（启用、所有）状态
   * @description 切换显示（启用、所有）状态
   * @description 如果禁用中，进行排序情况会把禁用顺序置后
   */
  showAll = false;
  onShowAll() {
    this.showAll = !this.showAll;
  }
}
