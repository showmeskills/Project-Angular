import { Component, Injectable, Input, OnInit } from '@angular/core';
import { ThemeTypeEnum } from 'src/app/shared/interfaces/base.interface';
import { OrderStatusEnum } from 'src/app/shared/interfaces/transaction';
import { TypeLangService } from 'src/app/shared/interfaces/status';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { cloneDeep } from 'lodash';
import { CommonModule } from '@angular/common';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';

@Injectable({
  providedIn: 'root',
})
export class FinanceService {
  constructor(private lang: LangService) {
    (async () => {
      this.statusListText = await Promise.all(this.statusList.map((e) => this.getStateLabel(e.value)));
    })();
  }

  statusListText: Array<TypeLangService & { text: string }> = [];

  readonly statusList: TypeLangService[] = [
    {
      name: '完成',
      type: ThemeTypeEnum.Success,
      value: OrderStatusEnum[OrderStatusEnum.Success],
      lang: 'finance.deposit.complete',
    },
    {
      name: '失败',
      type: ThemeTypeEnum.Danger,
      value: OrderStatusEnum[OrderStatusEnum.Fail],
      lang: 'finance.deposit.fail',
    },
    {
      name: '客户取消',
      type: ThemeTypeEnum.Info,
      value: OrderStatusEnum[OrderStatusEnum.UserCanceled],
      lang: 'finance.deposit.userCanceled',
    },
    {
      name: '等待中',
      type: ThemeTypeEnum.Yellow,
      value: OrderStatusEnum[OrderStatusEnum.Waiting],
      lang: 'finance.deposit.wait',
    },
    {
      name: '超时',
      type: ThemeTypeEnum.Danger,
      value: OrderStatusEnum[OrderStatusEnum.Timeout],
      lang: 'finance.deposit.overTime',
    },
    {
      name: '人工取消',
      type: ThemeTypeEnum.Info,
      value: OrderStatusEnum[OrderStatusEnum.Canceled],
      lang: 'finance.deposit.cancelled',
    },
    {
      name: '处理中',
      type: ThemeTypeEnum.Default,
      value: OrderStatusEnum[OrderStatusEnum.Process],
      lang: 'finance.deposit.process',
    },
    {
      name: '审核',
      type: ThemeTypeEnum.Yellow,
      value: OrderStatusEnum[OrderStatusEnum.Review],
      lang: 'finance.deposit.audit',
    },
    {
      name: '已通过',
      type: ThemeTypeEnum.Success,
      value: OrderStatusEnum[OrderStatusEnum.Passed],
      lang: 'finance.deposit.pass',
    },
    {
      name: '未通过',
      type: ThemeTypeEnum.Danger,
      value: OrderStatusEnum[OrderStatusEnum.NotPassed],
      lang: 'finance.deposit.notPass',
    },
    {
      name: '系统取消',
      type: ThemeTypeEnum.Info,
      value: OrderStatusEnum[OrderStatusEnum.SysCanceled],
      lang: 'finance.deposit.systemCanceled',
    },
    {
      name: '待定',
      type: ThemeTypeEnum.Blue,
      value: OrderStatusEnum[OrderStatusEnum.OnHold],
      lang: 'finance.withdrawals.onHold',
    },
  ]; // 订单状态

  /**
   * 获取状态
   * @param status
   */
  getState = (status: string): TypeLangService | undefined => {
    const stateList = cloneDeep(this.statusList);

    return stateList.find((e) => e.value === status) || ({ langArgs: {} } as any);
  };

  /**
   * 获取状态文本
   * @param status
   */
  async getStateText(status) {
    const item = this.getState(status);

    if (!item?.lang?.length) return Promise.resolve('');

    return this.lang.getOne(item.lang, item.langArgs);
  }

  /**
   * 获取状态文本以及当前类目
   * @param status
   */
  async getStateLabel(status) {
    const item = this.getState(status);
    let text = '';

    if (item?.lang?.length) {
      text = (await this.lang.getOne(item.lang, item.langArgs)) || '';
    }

    return { ...item, text: text || '' };
  }

  /**
   * 获取状态翻译后的文本（同步）
   */
  getStateTextSync(status: OrderStatusEnum) {
    return this.statusListText.find((e) => e.value === (status as any))?.text || '';
  }
}

@Component({
  selector: 'finance-status-label,[financeStatusLabel]',
  template: `
    <ng-container
      *ngIf="
        OrderStatusEnum[OrderStatusEnum.Review] === $any(status) &&
          ![undefined, null, ''].includes($any(isReviewLevel));
        else commonStatusTpl
      "
    >
      <app-label type="yellow" *ngIf="isReviewLevel">{{ 'finance.withdrawals.nd2review' | lang }}</app-label>
      <app-label type="primary" *ngIf="!isReviewLevel">{{ 'finance.withdrawals.st1review' | lang }}</app-label>
    </ng-container>
    <ng-template #commonStatusTpl>
      <app-label *ngIf="data.text; else tpl" [class.cursor-pointer]="pointer" [type]="data.type">{{
        data.text
      }}</app-label>
      <ng-template #tpl>
        <span [class.cursor-pointer]="pointer">{{ status }}</span>
      </ng-template>
    </ng-template>
  `,
  standalone: true,
  imports: [CommonModule, LabelComponent, LangPipe],
  providers: [FinanceService],
})
export class TransStatusLabel implements OnInit {
  constructor(public service: FinanceService) {}

  protected readonly OrderStatusEnum = OrderStatusEnum;

  @Input('pointer') pointer = false;

  @Input('financeStatusLabel') set betStatusLabel(v) {
    this.status = v;
    this.service.getStateLabel(v).then((item) => {
      this._data = item;
    });
  }

  status: OrderStatusEnum = OrderStatusEnum.Unknown;
  @Input('status') set _status(v: OrderStatusEnum) {
    this.status = v;
    this.service.getStateLabel(v).then((item) => {
      this._data = item;
    });
  }

  @Input() isReviewLevel: undefined | boolean = undefined;

  private _data: any = {};
  get data() {
    return this._data;
  }

  ngOnInit(): void {}
}
