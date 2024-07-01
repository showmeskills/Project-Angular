import { Component, OnInit } from '@angular/core';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { AppService } from 'src/app/app.service';
import { WalletApi } from 'src/app/shared/api/wallet.api';
import { TradeDetail, TradeItem } from 'src/app/shared/interfaces/conversion';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { ConversionStatusComponent } from '../conversion.service';
import { NgFor } from '@angular/common';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { LabelComponent } from 'src/app/shared/components/label/label.component';

@Component({
  selector: 'conversion-detail',
  templateUrl: './conversion-detail.component.html',
  styleUrls: ['./conversion-detail.component.scss'],
  standalone: true,
  imports: [
    LabelComponent,
    AngularSvgIconModule,
    FormRowComponent,
    NgFor,
    ConversionStatusComponent,
    TimeFormatPipe,
    CurrencyValuePipe,
    LangPipe,
  ],
})
export class ConversionDetailComponent implements OnInit {
  constructor(
    public modalRef: MatModalRef<ConversionDetailComponent>,
    private appService: AppService,
    private api: WalletApi
  ) {}

  item?: TradeItem;
  detail?: TradeDetail;

  ngOnInit(): void {
    this.appService.isContentLoadingSubject.next(true);
    this.api.conversionDetail(this.item?.id! || 0).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      this.detail = res;
    });
  }
}
