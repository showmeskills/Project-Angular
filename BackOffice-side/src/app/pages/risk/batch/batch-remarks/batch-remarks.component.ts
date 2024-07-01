import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmModalService } from 'src/app/shared/components/dialogs/confirm-modal/confirm-modal.service';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UploadChange } from 'src/app/shared/interfaces/upload';
import { AppService } from 'src/app/app.service';
import { RiskApi } from 'src/app/shared/api/risk.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { BatchRemarkInfo, BatchRemarkResponse } from 'src/app/shared/interfaces/risk';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { DestroyService } from 'src/app/shared/models/tools.model';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'batch-remarks',
  standalone: true,
  imports: [
    CommonModule,
    FormRowComponent,
    UploadComponent,
    AngularSvgIconModule,
    LangPipe,
    ReactiveFormsModule,
    EmptyComponent,
  ],
  templateUrl: './batch-remarks.component.html',
  styleUrls: ['./batch-remarks.component.scss'],
  providers: [DestroyService],
})
export class BatchRemarksComponent implements OnInit {
  constructor(
    public appService: AppService,
    private api: RiskApi,
    private fb: FormBuilder,
    private subHeaderService: SubHeaderService,
    private destroy$: DestroyService,
    private confirmModalService: ConfirmModalService
  ) {}

  isUploading = false;

  data = {
    batchId: '',
    list: [] as BatchRemarkInfo[],
  };

  formGroup = this.fb.group({
    excel: ['', Validators.required],
  });

  get list() {
    return this.data.list;
  }

  set list(val) {
    this.data.list = val;
  }

  ngOnInit(): void {
    this.subHeaderService.merchantId$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.reset();
    });
  }

  /**
   * 上传excel流请求
   * @param file
   */
  uploadExcelStream = (file) =>
    this.api.uploadRemarkFile(this.subHeaderService.merchantCurrentId, file, {
      reportProgress: true,
      observe: 'events',
    });

  /**
   * 上传excel回调
   * @param upload
   */
  async onUploadChange({ upload }: UploadChange<BatchRemarkResponse>) {
    if (upload?.state !== 'DONE') return;

    // 解析失败
    const res = upload.body?.batchId ? upload.body : undefined;
    if (!res) return this.appService.showToastSubject.next({ msgLang: 'form.parseFail' });

    // 解析为空
    if (!res.info || !res.info.length) this.appService.showToastSubject.next({ msgLang: 'form.parseEmpty' });

    this.data.batchId = upload.body?.batchId || '';
    this.data.list = res.info || [];
  }

  clearExcel() {
    this.data = {
      batchId: '',
      list: [],
    };
  }

  reset() {
    this.clearExcel();
    this.formGroup.reset();
  }

  /**
   * 移除批次
   * @param i
   */
  async removeBatch(i: number) {
    if ((await this.confirmModalService.open({ msgLang: 'risk.batch.removeItemTips' }).result) !== true) return;

    this.data.list.splice(i, 1);
  }

  /**
   * 提交
   */
  submit() {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid) return this.appService.showToastSubject.next({ msgLang: 'form.formInvalid' });

    // 无数据，请修改后重新上传
    if (!this.list.length) return this.appService.showToastSubject.next({ msgLang: 'risk.batch.emptyReupload' });

    this.appService.isContentLoadingSubject.next(true);
    this.api.addBatchRemark(this.subHeaderService.merchantCurrentId, this.data.batchId, this.list).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      this.appService.toastOpera(!!res?.batchId);

      if (res?.batchId) {
        this.confirmModalService
          .open({
            msg: 'BatchID：' + res?.batchId,
            type: 'success',
            dismissShow: false,
          })
          .result.finally(() => {
            this.reset();
          });
      }
    });
  }

  /**
   * 下载模板
   */
  downloadTemplate() {
    this.appService.isContentLoadingSubject.next(true);
    this.api.downBatchTemplate(1).subscribe(() => {
      this.appService.isContentLoadingSubject.next(false);
    });
  }
}
