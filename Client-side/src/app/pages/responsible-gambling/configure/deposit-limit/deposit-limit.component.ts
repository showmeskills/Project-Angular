import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { StandardPopupComponent } from 'src/app/shared/components/standard-popup/standard-popup.component';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { PopupService } from 'src/app/shared/service/popup.service';

@UntilDestroy()
@Component({
  selector: 'app-deposit-limit',
  templateUrl: './deposit-limit.component.html',
  styleUrls: ['./deposit-limit.component.scss'],
  host: { class: 'container' },
})
export class DepositLimitComponent implements OnInit {
  constructor(private layout: LayoutService, private popup: PopupService) {}

  isH5!: boolean;
  editMode: boolean = false;

  limitData = [
    { name: '24小时', value: 100, currency: 'USDT' },
    { name: '7天', value: 100, currency: 'USDT' },
    { name: '30天', value: 100, currency: 'USDT' },
  ];

  limit24h: string = '';
  limit7day: string = '';
  limit30day: string = '';
  password: string = '';

  ngOnInit() {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(x => (this.isH5 = x));
  }

  showConfirmPop() {}

  submit() {
    this.popup.open(StandardPopupComponent, {
      speed: 'faster',
      data: {
        content: '存款限额',
        description:
          '您的存款限额已更改，任何对存款限额的减少将立即生效。请在生效日期/时间之后返回该页面确认您存款限额的增加。',
        type: 'warn',
        buttons: [{ text: '确认', primary: true }],
      },
    });
  }
}
