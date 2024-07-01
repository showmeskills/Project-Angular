import { Component, Input, OnInit } from '@angular/core';
import { DepositApi } from 'src/app/shared/api/deposit.api';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { FormsModule } from '@angular/forms';
import { NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { TransStatusLabel } from 'src/app/pages/finance/finance.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  standalone: true,
  imports: [
    ModalTitleComponent,
    NgIf,
    FormsModule,
    NgSwitch,
    NgSwitchCase,
    ModalFooterComponent,
    TimeFormatPipe,
    FormatMoneyPipe,
    CurrencyValuePipe,
    LangPipe,
    TransStatusLabel,
  ],
})
export class EditComponent implements OnInit {
  @Input() public item!: any;
  constructor(
    public modal: MatModalRef<EditComponent, boolean>,
    private depositApi: DepositApi
  ) {}

  ngOnInit() {}

  ok(): void {
    const param = { id: this.item.id, remark: this.item.remark };
    this.depositApi.updateWithdrawRecordRemark(param).subscribe(() => {
      this.modal.close();
    });
  }

  close(): void {}
}
