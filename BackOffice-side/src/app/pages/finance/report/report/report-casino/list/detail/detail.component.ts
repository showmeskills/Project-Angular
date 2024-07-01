import { NgSwitch, NgSwitchCase, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Optional, Output } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { WinDirective, WinColorDirective } from 'src/app/shared/directive/common.directive';
import { WagerDetailUpdateConfig } from 'src/app/shared/interfaces/wager';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { BetStatusLabel } from 'src/app/pages/finance/report/report.service';
import { ReportOperaComponent } from 'src/app/pages/finance/report/report/report-opera/report-opera.component';

@Component({
  selector: 'report-casino-list-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  standalone: true,
  imports: [
    AngularSvgIconModule,
    CurrencyIconDirective,
    NgSwitch,
    NgSwitchCase,
    WinDirective,
    WinColorDirective,
    BetStatusLabel,
    NgIf,
    ReportOperaComponent,
    TimeFormatPipe,
    CurrencyValuePipe,
    LangPipe,
  ],
})
export class ReportCasinoListDetailComponent implements OnInit {
  constructor(@Optional() public modal: MatModalRef<ReportCasinoListDetailComponent>) {}

  @Input() detailData = {};
  @Output() update = new EventEmitter<WagerDetailUpdateConfig>();

  /** getters */
  get base(): any {
    return this.detailData || {};
  }

  ngOnInit() {}
}
