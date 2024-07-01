import { Component, Input, OnInit } from '@angular/core';
import { TransactionStatusService } from 'src/app/pages/money/transaction-list/state-label/transaction-status.service';
import { OrderLabelComponent } from 'src/app/pages/money/components/order-label.component';

@Component({
  selector: 'state-label',
  templateUrl: './state-label.component.html',
  styleUrls: ['./state-label.component.scss'],
  standalone: true,
  imports: [OrderLabelComponent],
})
export class StateLabelComponent implements OnInit {
  constructor(public transactionStatus: TransactionStatusService) {}

  @Input('data')
  get data() {
    return this._data || {};
  }

  set data(v: any) {
    this.transactionStatus.getStateLabel(v).then((item) => {
      this._data = item;
    });
  }

  private _data: any = {};

  ngOnInit(): void {}
}
