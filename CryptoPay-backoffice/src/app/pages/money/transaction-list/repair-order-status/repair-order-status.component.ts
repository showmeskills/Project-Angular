import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GoMoneyMerchant } from 'src/app/shared/interfaces/select.interface';
import { AppService } from 'src/app/app.service';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { ChannelApi } from 'src/app/shared/api/channel.api';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import {
  ModalFooterComponent,
  DismissCloseDirective,
} from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { InputTrimDirective } from 'src/app/shared/directive/input.directive';
import { MatOptionModule } from '@angular/material/core';
import { NgFor } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';

@Component({
  selector: 'repair-order-status',
  templateUrl: './repair-order-status.component.html',
  styleUrls: ['./repair-order-status.component.scss'],
  standalone: true,
  imports: [
    ModalTitleComponent,
    FormsModule,
    ReactiveFormsModule,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    NgFor,
    MatOptionModule,
    InputTrimDirective,
    ModalFooterComponent,
    DismissCloseDirective,
    LangPipe,
  ],
})
export class RepairOrderStatusComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private api: ChannelApi,
    private appService: AppService,
    public modalRef: MatModalRef<RepairOrderStatusComponent>
  ) {}

  merchantList: GoMoneyMerchant[] = [];

  formGroup = this.fb.group({
    merchant: [null as null | number, Validators.required],
    order: ['', Validators.required],
  });

  ngOnInit(): void {}

  onSubmit() {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid) return;
    this.appService.isContentLoadingSubject.next(true);
    this.api.order_tryfixwithdraworder(this.formGroup.value.merchant!, this.formGroup.value.order!).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      if (res === true) return this.modalRef.close(true);
      this.appService.toastOpera(false);
    });
  }
}
