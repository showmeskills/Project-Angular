import { Component, OnInit } from '@angular/core';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { IconSrcDirective } from 'src/app/shared/components/icon/icon.directive';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { AsyncPipe, NgClass, NgComponentOutlet, NgFor, NgIf } from '@angular/common';
import { DestroyService } from 'src/app/shared/models/tools.model';
import { SearchDirective, SearchInpDirective } from 'src/app/shared/directive/search.directive';
import { OwlDateTimeModule } from 'src/app/components/datetime-picker';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { KYCReviewTypeEnum } from 'src/app/shared/interfaces/kyc';
import { MonitorService } from 'src/app/pages/risk/monitor/monitor.service';

@Component({
  selector: 'monitor',
  templateUrl: './monitor.component.html',
  styleUrls: ['./monitor.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    NgFor,
    MatOptionModule,
    IconSrcDirective,
    NgClass,
    PaginatorComponent,
    TimeFormatPipe,
    FormatMoneyPipe,
    CurrencyValuePipe,
    LangPipe,
    SearchDirective,
    OwlDateTimeModule,
    EmptyComponent,
    SearchInpDirective,
    AsyncPipe,
    AngularSvgIconModule,
    NgComponentOutlet,
  ],
  providers: [DestroyService],
})
export class MonitorComponent implements OnInit {
  constructor(
    public subHeaderService: SubHeaderService,
    public service: MonitorService
  ) {}

  protected readonly KYCReviewTypeEnum = KYCReviewTypeEnum;

  ngOnInit(): void {
    this.subHeaderService.loadCountry(true);
  }
}
