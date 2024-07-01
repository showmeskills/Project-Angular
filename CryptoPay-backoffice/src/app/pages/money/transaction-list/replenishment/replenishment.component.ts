import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatModalModule, MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { LangModule } from 'src/app/shared/components/lang/lang.module';
import { FormRowModule } from 'src/app/shared/components/form-row/form-row.module';
import { MatSelectModule } from '@angular/material/select';
import { AppService } from 'src/app/app.service';
import { FormBuilder, Validators } from '@angular/forms';
import { VirtualApi } from 'src/app/shared/api/virtual.api';

import { NetworkSelect } from 'src/app/shared/interfaces/select.interface';
import { Currency } from 'src/app/shared/interfaces/currency';
import { InputTrimDirective } from 'src/app/shared/directive/input.directive';

@Component({
  selector: 'replenishment',
  standalone: true,
  imports: [CommonModule, MatModalModule, LangModule, FormRowModule, MatSelectModule, InputTrimDirective],
  templateUrl: './replenishment.component.html',
})
export class ReplenishmentComponent implements OnInit {
  constructor(
    private appService: AppService,
    private fb: FormBuilder,
    private api: VirtualApi,
    private modalRef: MatModalRef<ReplenishmentComponent>
  ) {}

  currencyList: Currency[] = [];
  merchantList: any[] = [];
  networkList: NetworkSelect[] = [];

  formGroup = this.fb.group({
    merchantId: ['', Validators.required],
    currency: ['', Validators.required],
    network: ['', Validators.required],
    txHash: ['', Validators.required],
  });

  ngOnInit(): void {
    this.appService.isContentLoadingSubject.next(true);
    this.api.getNetwork().subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      this.networkList = res;
    });
  }

  onSubmit() {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid) return;

    this.appService.isContentLoadingSubject.next(true);
    this.api
      .replenishmentOrder({
        merchantId: +this.formGroup.value.merchantId! || 0,
        // userId: this.userId!,
        token: this.formGroup.value.currency!,
        network: this.formGroup.value.network!,
        txHash: this.formGroup.value.txHash!,
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);

        const successed = res === true;
        const msgLang = successed ? 'common.operationSuccess' : 'form.failAttach';
        const msgArgs = successed ? {} : { msg: res?.data?.errorMessage || '' };

        this.appService.showToastSubject.next({ msgLang, successed, msgArgs });
        successed && this.modalRef.close(true);
      });
  }
}
