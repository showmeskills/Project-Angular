import { Component, OnInit } from '@angular/core';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { DividendComponent } from '../dividend/dividend.component';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';

@Component({
  selector: 'coupon-detail',
  templateUrl: './coupon-detail.component.html',
  styleUrls: ['./coupon-detail.component.scss'],
  standalone: true,
  imports: [ModalTitleComponent, DividendComponent, LangPipe],
})
export class CouponDetailComponent implements OnInit {
  constructor(public modal: MatModalRef<CouponDetailComponent>) {}

  ngOnInit(): void {}
}
