import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { AppService } from 'src/app/app.service';
import { ActivityAPI } from 'src/app/shared/api/activity.api';
import { MemberApi } from 'src/app/shared/api/member.api';
import { MatModalModule, MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { CurrencyIconDirective, IconSrcDirective } from 'src/app/shared/components/icon/icon.directive';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';

@Component({
  selector: 'bonus-detail-popup',
  templateUrl: './bonus-detail-popup.component.html',
  styleUrls: ['./bonus-detail-popup.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatModalModule,
    FormsModule,
    LangPipe,
    EmptyComponent,
    LoadingDirective,
    AngularSvgIconModule,
    IconSrcDirective,
    CurrencyValuePipe,
    CurrencyIconDirective,
    LabelComponent,
    TimeFormatPipe,
  ],
})
export class FreeSpinBonusDetailPopupComponent implements OnInit {
  constructor(
    public modal: MatModalRef<FreeSpinBonusDetailPopupComponent, boolean>,
    private appService: AppService,
    public lang: LangService,
    private memberApi: MemberApi,
    private activityAPI: ActivityAPI
  ) {}

  @Input() id;

  /** true = 奖品/优惠券：查看freeSpin奖金详情
   *  false = 会员详情：查看freeSpin奖金详情
   */
  @Input() isPrizeCoupon = false;

  /** 数据 */
  data;

  ngOnInit() {
    this.appService.isContentLoadingSubject.next(true);
    this[this.isPrizeCoupon ? 'activityAPI' : 'memberApi'].getfreespindetail(this.id).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      this.data = res || {};
    });
  }
}
