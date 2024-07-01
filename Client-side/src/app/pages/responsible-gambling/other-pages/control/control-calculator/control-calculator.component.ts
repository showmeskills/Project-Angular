import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';

@UntilDestroy()
@Component({
  selector: 'app-control-calculator',
  templateUrl: './control-calculator.component.html',
  styleUrls: ['./control-calculator.component.scss'],
})
export class ControlCalculatorComponent implements OnInit {
  constructor(private layout: LayoutService, private localeService: LocaleService) {}

  isH5!: boolean;

  datas = [
    {
      title: this.localeService.getValue('r_c'),
      isTotalIncome: true,
      values: [
        { label: this.localeService.getValue('r_d'), value: 0 },
        { label: this.localeService.getValue('r_e'), value: 0 },
        { label: this.localeService.getValue('r_f'), value: 0 },
        { label: this.localeService.getValue('r_g'), value: 0 },
      ],
      totalTitle: this.localeService.getValue('r_i'),
    },
    {
      title: this.localeService.getValue('r_h'),
      isTotalIncome: false,
      values: [
        { label: this.localeService.getValue('r_j'), value: 0 },
        { label: this.localeService.getValue('r_k'), value: 0 },
        { label: this.localeService.getValue('r_l'), value: 0 },
        { label: this.localeService.getValue('r_m'), value: 0 },
      ],
      totalTitle: this.localeService.getValue('r_n'),
    },
  ];

  /**@totalIncome 总收入 */
  totalIncome: number = 0;

  /**@totalPayment 总支出 */
  totalPayment: number = 0;

  /**@gamingPay 游戏支出 */
  gamingPay: number = 0;

  /**@totalBalance 余额*/
  totalBalance: number = 0;

  /**@isShowResult 是否展示计算结果页面*/
  isShowResult: boolean = false;

  /**@isEmptyValue 是否是空 */
  isEmptyValue!: boolean;

  /**@incomeList  收入列表*/
  incomeList: any = [];

  /**@paymentList 支出列表*/
  paymentList: any = [];

  /**@paymentWidth 支出宽度 */
  paymentWidth: number = 0;

  /**@gameWidth 游戏宽度 */
  gameWidth: number = 0;

  /**@balanceWidth 剩余宽度 */
  balanceWidth: number = 20;

  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(v => (this.isH5 = v));
  }

  /**@onChange input change事件 */
  onChange(event: any) {
    event.length === 0 ? (this.isEmptyValue = false) : (this.isEmptyValue = true);
  }

  /**@total 计算总收入 */
  total(isTotalIncome: boolean): number {
    const income = (this.totalIncome = this.datas[0].values.map(item => item.value).reduce((a, b) => a * 1 + b * 1, 0));
    const payment = (this.totalPayment = this.datas[1].values
      .map(item => item.value)
      .reduce((a, b) => a * 1 + b * 1, 0));
    if (isTotalIncome) {
      return income;
    } else {
      return payment;
    }
  }

  /**@canCalculate 可以计算机 */
  canCalculate(): boolean {
    return this.isEmptyValue;
  }

  /**@onCalculate 展示计算结果 */
  onCalculate() {
    this.isShowResult = !this.isShowResult;
    this.incomeList = this.datas[0].values;
    this.paymentList = this.datas[1].values;
    this.gamingPay = Number(this.gamingPay);
    const balance = (this.totalBalance = Number(this.totalIncome).minus(this.totalPayment).minus(this.gamingPay));
    const perPercent = Number(balance).add(this.gamingPay).add(this.totalPayment).divide(100);
    this.paymentWidth = Number(this.totalPayment).divide(perPercent) || 25;
    this.gameWidth = Number(this.gamingPay).divide(perPercent) || 25;
    this.balanceWidth = Number(balance).divide(perPercent) || 25;
  }

  /**@onRecalculcate */
  onRecalculcate() {
    this.isShowResult = !this.isShowResult;
    this.datas = [
      {
        ...this.datas[0],
        values: [
          { label: this.localeService.getValue('r_d'), value: 0 },
          { label: this.localeService.getValue('r_e'), value: 0 },
          { label: this.localeService.getValue('r_f'), value: 0 },
          { label: this.localeService.getValue('r_g'), value: 0 },
        ],
      },
      {
        ...this.datas[1],
        values: [
          { label: this.localeService.getValue('r_j'), value: 0 },
          { label: this.localeService.getValue('r_k'), value: 0 },
          { label: this.localeService.getValue('r_l'), value: 0 },
          { label: this.localeService.getValue('r_m'), value: 0 },
        ],
      },
    ];
  }
}
