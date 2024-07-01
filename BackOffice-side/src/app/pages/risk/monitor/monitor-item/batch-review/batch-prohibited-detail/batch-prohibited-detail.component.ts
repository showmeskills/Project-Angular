import { Component, EventEmitter, inject, OnInit, TemplateRef } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { MatModal, MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { AppService } from 'src/app/app.service';
import {
  SelectChildrenDirective,
  SelectDirective,
  SelectGroupDirective,
} from 'src/app/shared/directive/select.directive';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { BatchStatusComponent } from 'src/app/pages/risk/batch/batch-list/batch-status/batch-status.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CodeDescription } from 'src/app/shared/interfaces/base.interface';
import {
  BatchListInfo,
  BatchListItem,
  BatchListProhibitedDetail,
  BatchReviewInfoParams,
} from 'src/app/shared/interfaces/risk';
import { InputTrimDirective } from 'src/app/shared/directive/input.directive';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { RiskApi } from 'src/app/shared/api/risk.api';
import { AttrDisabledDirective } from 'src/app/shared/directive/d-disabled.directive';
import { BatchService } from 'src/app/pages/risk/batch/batch.service';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { forkJoin } from 'rxjs';
import { ProviderSelect } from 'src/app/shared/interfaces/provider';
import { SelectApi } from 'src/app/shared/api/select.api';
import { ProviderGroupItem } from 'src/app/shared/interfaces/select.interface';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'batch-prohibited-detail',
  standalone: true,
  imports: [
    CommonModule,
    ModalTitleComponent,
    LangPipe,
    SelectGroupDirective,
    SelectChildrenDirective,
    ReactiveFormsModule,
    FormsModule,
    LabelComponent,
    FormRowComponent,
    BatchStatusComponent,
    AngularSvgIconModule,
    SelectDirective,
    InputTrimDirective,
    ModalFooterComponent,
    AttrDisabledDirective,
    InputTrimDirective,
    TimeFormatPipe,
    NgbPopover,
  ],
  templateUrl: './batch-prohibited-detail.component.html',
  styleUrls: ['./batch-prohibited-detail.component.scss'],
})
export class BatchProhibitedDetailComponent implements OnInit {
  public modal = inject(MatModalRef<BatchProhibitedDetailComponent, boolean>);
  public lang = inject(LangService);
  private appService = inject(AppService);
  public modalService = inject(MatModal);
  private riskApi = inject(RiskApi);
  public batchService = inject(BatchService);
  private selectApi = inject(SelectApi);

  ngOnInit() {
    forkJoin([
      this.selectApi.getProviderGroupSelect({ tenantId: this.data?.tenantId || 0, gameStatue: 'Online' }),
    ]).subscribe(([providerList]) => {
      this.providerList = providerList || [];
    });
  }

  providerList: ProviderGroupItem<ProviderSelect>[] = [];

  /**
   * 状态列表
   */
  statusList: CodeDescription[] = [];

  /**
   * 调账数据
   */
  data?: BatchListItem<BatchListProhibitedDetail>;

  /**
   * 重新拉取请求加载
   */
  reload$ = new EventEmitter<boolean>();

  /**
   * 是否只读查看弹窗
   */
  isView = false;

  /**
   * 是否审核中
   */
  get isReviewing() {
    return this.isView ? false : this.data?.status === 'Pending';
  }

  /**
   * 是否有选择
   */
  get hasCheckbox() {
    return this.data?.info?.some((e) => e['checked']);
  }

  rejectRemarkControl = new FormControl('', Validators.required);
  reviewTypeBatchControl = new FormControl(true); // true=通过  false=拒绝
  rejectRemarkBatchControl = new FormControl('');

  /**
   * 批量提交
   */
  confirm() {
    this.rejectRemarkBatchControl.markAllAsTouched();

    if (!this.hasCheckbox) return this.appService.showToastSubject.next({ msgLang: 'risk.batch.noSelect' });
    if (this.rejectRemarkBatchControl.invalid)
      return this.appService.showToastSubject.next({ msgLang: 'form.formInvalid' });

    this.onSubmit(this.reviewTypeBatchControl.value!, undefined, null, (res) => res && this.modal.close(true));
  }

  /**
   * 提交
   * @param tpl
   * @param pass {boolean} 是否通过
   * @param item {BatchListItem<BatchListProhibitedDetail>} 单个审批项
   * @param c {function} 关闭弹窗
   */
  async onSubmit(
    pass: boolean,
    item?: BatchListInfo<BatchListProhibitedDetail>,
    tpl?: TemplateRef<any> | null,
    c?: (boolean) => void
  ) {
    const getInfoItem = (item: BatchListInfo<BatchListProhibitedDetail>) => ({
      status: pass ? 'Success' : 'Failed', //  Pending:1 Failed:2 Partially:3 Success:4 批量状态
      reviewId: item?.id!, // 每个子项的id
      remark: this.rejectRemarkControl.value || '', // 拒绝，备注
    });

    const sendData = {
      id: this.data?.id!, // 审核id
      tenantId: this.data?.tenantId!, // 商户id
      batchType: this.data?.batchType!, // 批量类型
      info: [] as BatchReviewInfoParams[],
    };
    const checkList = this.data?.info.filter((e) => e['checked']).map((e) => getInfoItem(e)) || [];

    // 通过
    if (pass) {
      sendData.info = item ? [getInfoItem(item)] : checkList;
    } else {
      // 拒绝
      if (item) {
        this.rejectRemarkControl.reset('');
        const rejectMsg = await this.modalService.open(tpl!, { width: '500px' }).result;
        sendData.info = [{ ...getInfoItem(item), remark: rejectMsg }];
      } else {
        sendData.info = checkList.map((e) => ({ ...e, remark: this.rejectRemarkBatchControl.value || '' }));
      }
    }

    this.appService.isContentLoadingSubject.next(true);
    this.riskApi.batchReview(sendData).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      this.reload$.next(true);
      c && c(res === true);
    });
  }

  /**
   * 提交失败原因
   * @param c
   */
  confirmReject(c: any) {
    this.rejectRemarkControl.markAllAsTouched();
    if (this.rejectRemarkControl.invalid) return;

    c(this.rejectRemarkControl.value);
  }

  /**
   * 批量操作类型改变
   */
  batchTypeChange() {
    this.rejectRemarkBatchControl.setValidators(this.reviewTypeBatchControl.value! ? null : Validators.required);
    this.rejectRemarkBatchControl.updateValueAndValidity();
  }

  /**
   * 获取厂商数据
   */
  getProviderData(providerCatId: any) {
    if (!providerCatId) {
      return { provider: undefined, current: undefined };
    }

    let child: ProviderSelect | undefined;
    const parent = this.providerList.find((e) =>
      e.providers.some((j) => {
        const res = j.providerCatId === providerCatId;
        if (res) {
          child = j;
        }
        return res;
      })
    );

    return { provider: parent, current: child };
  }

  showGameMaker(arr: string[]): string {
    let str = '';
    arr.forEach((game) => {
      str += this.getProviderData(game)?.current?.name + ', ';
    });
    return str;
  }
}
