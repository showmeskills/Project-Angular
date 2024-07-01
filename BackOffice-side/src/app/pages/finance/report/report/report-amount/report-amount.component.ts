import { Component, EventEmitter, HostBinding, Input, OnInit, Output } from '@angular/core';
import { SupplierReportPayoutModule } from 'src/app/shared/interfaces/supplier';
import { CommonModule } from '@angular/common';
import { EmptyModule } from 'src/app/shared/components/empty/empty.module';

import { LangModule } from 'src/app/shared/components/lang/lang.module';

import { AngularSvgIconModule } from 'angular-svg-icon';
import { FlipBackDirective, FlipDirective, FlipFaceDirective } from 'src/app/shared/directive/flip/flip.directive';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'report-amount',
  templateUrl: './report-amount.component.html',
  styleUrls: ['./report-amount.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    EmptyModule,
    AngularSvgIconModule,
    LangModule,
    FlipDirective,
    FlipFaceDirective,
    CurrencyValuePipe,
    CurrencyIconDirective,
    FlipBackDirective,
  ],
})
export class ReportAmountComponent implements OnInit {
  constructor(private route: ActivatedRoute) {}
  isTransactionHistory = false;
  ngOnInit(): void {
    const parentRoute = this.route.parent;
    const parentRoutePath = parentRoute?.snapshot?.routeConfig?.path;
    parentRoutePath == 'transaction-report-chart'
      ? (this.isTransactionHistory = true)
      : (this.isTransactionHistory = false);
  }

  @Input() title = '';
  @Input() data: SupplierReportPayoutModule | undefined = undefined;

  @Output() flipChange = new EventEmitter();

  @HostBinding('style.flex') get hostWidth() {
    const w = this._isBack ? 400 : 306;
    return `0 0 ${w}px`;
  }

  private _isBack = false;

  onFlipChange(e) {
    this._isBack = e;
    this.flipChange.emit(e);
  }

  get currencyList() {
    return [
      ...new Set([...Object.keys(this.data?.currency || {}), ...Object.keys(this.data?.activeFlowCurrency || {})]),
    ].sort();
  }
}
