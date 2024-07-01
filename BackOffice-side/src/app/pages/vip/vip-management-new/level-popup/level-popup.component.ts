import { Component, Input, OnInit } from '@angular/core';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { NgFor, NgIf } from '@angular/common';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';

@Component({
  selector: 'vip-management-level-popup',
  templateUrl: './level-popup.component.html',
  styleUrls: ['./level-popup.component.scss'],
  standalone: true,
  imports: [
    ModalTitleComponent,
    NgFor,
    NgIf,
    EmptyComponent,
    ModalFooterComponent,
    FormatMoneyPipe,
    CurrencyValuePipe,
    LangPipe,
  ],
})
export class VipManagementNewLevelPopupComponent implements OnInit {
  constructor(public modal: MatModalRef<VipManagementNewLevelPopupComponent, boolean>) {}

  @Input() tenantId: string;
  @Input() type: string;
  @Input() list: any[] = [];

  ngOnInit() {}

  confirm() {}
}
