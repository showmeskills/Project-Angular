import { Injectable } from '@angular/core';
import { finalize } from 'rxjs';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { AppService } from 'src/app/app.service';
import { cloneDeep } from 'lodash';
import { map, tap } from 'rxjs/operators';
import { PSPApi } from 'src/app/shared/api/psp.api';
import { PSPRuleAddParams, PSPRuleItem } from 'src/app/shared/interfaces/psp';
import { conditionItem, PSPConditionEnum } from 'src/app/pages/pay/psp-routing/rule-edit/rule-edit.component';

@Injectable({
  providedIn: 'root',
})
export class PSPRuleService {
  constructor(private subHeaderService: SubHeaderService, private appService: AppService, private api: PSPApi) {}

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
  rules: PSPRuleItem[] = [];

  /**
   * 是否有隐藏的规则
   */
  get hasHiddenRules() {
    return this.rules.some((e) => !e.isEnabled);
  }

  /**
   * @description 新增规则
   */
  addRule$(params: PSPRuleAddParams) {
    return this.updateRule$(params, true);
  }

  /**
   * @description 编辑规则
   */
  editRule$(params: PSPRuleAddParams) {
    return this.updateRule$(params);
  }

  /**
   * @description 更新规则
   */
  updateRule$(params: Partial<PSPRuleAddParams>, isAdd?: boolean) {
    params = cloneDeep(params);

    const sendData: PSPRuleAddParams & PSPRuleItem = {
      ...(params as Required<PSPRuleAddParams>),
      merchantId: +this.subHeaderService.merchantCurrentId,
      groupId: this.curGroupId,
    };

    this.ruleLoading = true;
    return this.api[isAdd ? 'addStrategy' : 'updateStrategy'](sendData).pipe(
      finalize(() => (this.ruleLoading = false)),
      tap((res) => {
        this.appService.toastOpera(res === true);

        // 变化成功，重新拉取
        res === true && this.loadRules();
      })
    );
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
            Object.keys(e.conditions || {}).forEach((actionKey) => {
              if (
                ['totalTime', 'totalWithdrawalCount'].includes(actionKey) &&
                ['', null, 0].includes(e.conditions[actionKey])
              ) {
                e.conditions[actionKey] = null;
                if (actionKey === 'totalTime') {
                  e.conditions.timeUnit = null as any;
                }
              }
            });
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
   * 切换显示（启用、所有）状态
   * @description 切换显示（启用、所有）状态
   * @description 如果禁用中，进行排序情况会把禁用顺序置后
   */
  showAll = false;
  onShowAll() {
    this.showAll = !this.showAll;
  }

  getConditionList(): conditionItem[] {
    return [
      { name: '交易币种', lang: 'finance.rule.currencyType', field: PSPConditionEnum.currency },
      { name: 'KYC', lang: 'finance.rule.kycLevel', field: PSPConditionEnum.kycLevel },
      { name: '首次存款', lang: 'finance.rule.firstDeposit', field: PSPConditionEnum.firstDeposit },
      { name: '首次使用的支付方式', lang: 'finance.rule.firstPayment', field: PSPConditionEnum.firstPayment },
      {
        name: 'VIP级别',
        lang: 'finance.rule.vipLevel',
        field: PSPConditionEnum.vipLevel,
        children: [
          { name: 'vip等级小于', lang: 'finance.rule.vipLevelLessthen', field: PSPConditionEnum.vipLevelLessthen },
          { name: 'vip等级大于', lang: 'finance.rule.vipLevelMorethen', field: PSPConditionEnum.vipLevelMorethen },
        ],
      },
      {
        name: 'Tx数量',
        lang: 'finance.rule.txCount',
        field: PSPConditionEnum.txCount,
        children: [
          { name: '存款最大笔数', lang: 'finance.rule.txCountMaxDeposit', field: PSPConditionEnum.maxDepositCount },
          { name: '存款最小笔数', lang: 'finance.rule.txCountMinDeposit', field: PSPConditionEnum.minDepositCount },
          {
            name: '提款最大笔数',
            lang: 'finance.rule.txCountMaxWithdrawal',
            field: PSPConditionEnum.maxWithdrawalCount,
          },
          {
            name: '提款最小笔数',
            lang: 'finance.rule.txCountMinWithdrawal',
            field: PSPConditionEnum.minWithdrawalCount,
          },
        ],
      },
      {
        name: '交易金额（USDT币种）',
        lang: 'finance.rule.txAmount',
        field: PSPConditionEnum.txAmount,
        children: [
          { name: '存款金额≥', lang: 'finance.rule.txAmountMaxDeposit', field: PSPConditionEnum.maxDeposit },
          { name: '存款金额≤', lang: 'finance.rule.txAmountMinDeposit', field: PSPConditionEnum.minDeposit },
          { name: '提款金额≥', lang: 'finance.rule.txAmountMaxWithdrawal', field: PSPConditionEnum.maxWithdrawal },
          { name: '提款金额≤', lang: 'finance.rule.txAmountMinWithdrawal', field: PSPConditionEnum.minWithdrawal },
        ],
      },
      {
        name: '总计',
        lang: 'finance.rule.total',
        field: PSPConditionEnum.total,
        children: [
          {
            name: '存款总成功金额≥',
            lang: 'finance.rule.totalDepositAmountGte',
            field: PSPConditionEnum.totalDepositAmountGt,
            suffix: 'USDT',
          },
          {
            name: '存款总成功金额≤',
            lang: 'finance.rule.totalDepositAmountLte',
            field: PSPConditionEnum.totalDepositAmountLe,
            suffix: 'USDT',
          },
          {
            name: '存款总成功笔数≥',
            lang: 'finance.rule.totalDepositCountGte',
            field: PSPConditionEnum.totalDepositAmountCountGt,
          },
          {
            name: '存款总成功笔数≤',
            lang: 'finance.rule.totalDepositCountLte',
            field: PSPConditionEnum.totalDepositAmountCountLe,
          },
          {
            name: '提款总成功金额≥',
            lang: 'finance.rule.totalWithdrawalAmountGte',
            field: PSPConditionEnum.totalWithdrawalAmountGt,
            suffix: 'USDT',
          },
          {
            name: '提款总成功金额≤',
            lang: 'finance.rule.totalWithdrawalAmountLte',
            field: PSPConditionEnum.totalWithdrawalAmountLe,
            suffix: 'USDT',
          },
          {
            name: '提款总成功笔数≥',
            lang: 'finance.rule.totalWithdrawalCountGte',
            field: PSPConditionEnum.totalWithdrawalAmountCountGt,
          },
          {
            name: '提款总成功笔数≤',
            lang: 'finance.rule.totalWithdrawalCountLte',
            field: PSPConditionEnum.totalWithdrawalAmountCountLe,
          },
          { name: '时间', lang: 'finance.rule.totalTime', field: PSPConditionEnum.totalTime },
          { name: '时间单位', lang: 'finance.rule.timeUnit', field: PSPConditionEnum.timeUnit },
        ],
      },
    ];
  }

  /**
   * 获取条件类目
   */
  getConditionNode(field: PSPConditionEnum): null | conditionItem {
    let res: null | conditionItem = null;
    this.getConditionList().find((e) => {
      if (e.children && e.children.length) {
        const innerRes = e.children.find((c) => c.field === field);

        if (innerRes) {
          res = innerRes;
        }

        return !!innerRes;
      } else {
        const hasField = e.field === field;
        if (hasField) {
          res = e;
        }

        return hasField;
      }
    });

    return res;
  }
}
