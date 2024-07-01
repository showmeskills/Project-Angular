import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Optional, Output } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { WinDirective, WinColorDirective } from 'src/app/shared/directive/common.directive';
import { ReportSportDetailItem, WagerDetailUpdateConfig } from 'src/app/shared/interfaces/wager';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { BetStatusLabel } from 'src/app/pages/finance/report/report.service';
import { ReportOperaComponent } from 'src/app/pages/finance/report/report/report-opera/report-opera.component';

@Component({
  selector: 'report-sport-list-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    NgTemplateOutlet,
    BetStatusLabel,
    MatTabsModule,
    AngularSvgIconModule,
    ReportOperaComponent,
    WinDirective,
    WinColorDirective,
    CurrencyIconDirective,
    TimeFormatPipe,
    CurrencyValuePipe,
    LangPipe,
  ],
})
export class ReportSportListDetailComponent implements OnInit {
  constructor(@Optional() public modal: MatModalRef<ReportSportListDetailComponent>) {}

  @Input() detailData: ReportSportDetailItem[] = [];
  @Output() update = new EventEmitter<WagerDetailUpdateConfig>();

  curTab = 0;

  /** getters */
  get simple() {
    return this.detailData?.length ? this.detailData?.length <= 1 : true;
  }

  get curData() {
    return this.simple ? this.detailData?.[0] : this.detailData;
  }

  get operaData() {
    return this.simple ? this.detailData?.[0] : this.detailData[this.curTab];
  }

  get base(): any {
    return this.detailData?.[0] || {};
  }

  ngOnInit() {}
}
