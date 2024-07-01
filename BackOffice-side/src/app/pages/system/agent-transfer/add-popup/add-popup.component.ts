import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ActivatedRoute } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { AgentApi } from 'src/app/shared/api/agent.api';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';

@Component({
  selector: 'system-agent-transfer-add-popup',
  templateUrl: './add-popup.component.html',
  styleUrls: ['./add-popup.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ModalTitleComponent,
    FormsModule,
    ReactiveFormsModule,
    FormRowComponent,
    FormWrapComponent,
    MatFormFieldModule,
    ModalFooterComponent,
    LangPipe,
  ],
})
export class AgentTransferAddPopupComponent implements OnInit {
  constructor(
    public modal: MatModalRef<AgentTransferAddPopupComponent>,
    public activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    public appService: AppService,
    private api: AgentApi,
    public localStorageService: LocalStorageService
  ) {}

  @Input() tenantId;

  formGroup: FormGroup = this.fb.group({
    uid: ['', Validators.required],
    superUid: ['', Validators.required],
    remark: [''],
  });

  ngOnInit() {}

  onSubmit() {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid) return;

    const params = {
      tenantId: this.tenantId,
      operatorName: this.localStorageService.userInfo?.userName,
      uid: this.formGroup.value.uid,
      superUid: this.formGroup.value.superUid,
      remark: this.formGroup.value.remark,
    };

    this.appService.isContentLoadingSubject.next(true);
    this.api.user_transform(params).subscribe((res) => {
      if (res?.code !== 0)
        return this.appService.showToastSubject.next(
          res?.message ? { msg: res?.message } : { msgLang: 'common.operationFailed' }
        );

      this.appService.showToastSubject.next({ msgLang: 'common.sucOperation', successed: true });
      this.modal.close(true);
    });
  }
}
