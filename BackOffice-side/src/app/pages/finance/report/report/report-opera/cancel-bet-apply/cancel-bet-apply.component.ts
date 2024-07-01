import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppService } from 'src/app/app.service';
import { MatModalModule, MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { WagerApi } from 'src/app/shared/api/wager.api';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangModule } from 'src/app/shared/components/lang/lang.module';
import { FormRowModule } from 'src/app/shared/components/form-row/form-row.module';
import { UploadModule } from 'src/app/shared/components/upload/upload.module';
import { FormBuilder, ValidatorFn } from '@angular/forms';

import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { ImgViewerComponent } from 'src/app/shared/components/img-viewer/img-viewer.component';
import { CancelBetApply } from 'src/app/shared/interfaces/wager';
import { cloneDeep } from 'lodash';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';

@Component({
  selector: 'cancel-bet-apply',
  standalone: true,
  imports: [
    CommonModule,
    MatModalModule,
    LangModule,
    FormRowModule,
    UploadModule,
    ImgViewerComponent,
    CurrencyValuePipe,
  ],
  templateUrl: './cancel-bet-apply.component.html',
  styleUrls: ['./cancel-bet-apply.component.scss'],
})
export class CancelBetApplyComponent implements OnInit {
  constructor(
    private appService: AppService,
    public modalRef: MatModalRef<CancelBetApplyComponent>,
    private api: WagerApi,
    private lang: LangService,
    private fb: FormBuilder
  ) {}

  data: CancelBetApply;
  @Input('data') set _data(v: CancelBetApply) {
    this.data = v;

    if (v.imgList || v.remark) {
      this.imgList = v.imgList ? cloneDeep(v.imgList) : [];
      this.formGroup.patchValue({
        img: '',
        remark: v.remark || '',
      });
    }
  }

  @Input() isView = false;

  private _imgList: string[] = [];
  get imgList() {
    return this._imgList;
  }

  set imgList(list: string[]) {
    this._imgList = list;
    this.formGroup.controls.img.updateValueAndValidity();
  }

  formGroup = this.fb.group({
    remark: [''],
    img: ['', this.customUploadValidator()],
  });

  ngOnInit(): void {}

  submit() {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid) return;
    this.wagerCancel();
  }

  /**
   * 注单取消申请
   */
  async wagerCancel() {
    this.appService.isContentLoadingSubject.next(true);
    this.api
      .cancelBet({
        uid: this.data.uid, // 用户Uid
        wagerNumber: this.data.orderNumber, // 第三方订单号
        thirdPartOrderNumber: this.data.wagerNumber, // 交易单号
        gameProvider: this.data.gameProvider, // 游戏厂商
        gameCategory: this.data.gameCategory, // 游戏类型
        currency: this.data.currency, // 币别
        principal: this.data.principal, // 下注金额 交易本金
        bonus: this.data.bonus, // 抵用金
        betTime: this.data.betTime, // 交易时间
        attachmentList: this.imgList, // 附件(jpg, png, gif, bmp，pdf 5mb以内)
        remark: this.formGroup.value.remark || '', // 备注信息
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);
        this.processRes(res);
      });
  }

  async processRes(successed: boolean) {
    const operateLang = await this.lang.getOne('game.detail.cancelBet');
    const apply = await this.lang.getOne('game.detail.apply'); // 申请
    const suc = await this.lang.getOne('game.detail.suc');
    const fail = await this.lang.getOne('game.detail.fail');
    const msg = operateLang + apply + (successed ? suc : fail);

    this.appService.showToastSubject.next({ msg, successed });
    successed && this.modalRef.close(true);
  }

  /** 上传图片 */
  onUpload({ uploadURL }, upload: UploadComponent, viewer: ImgViewerComponent) {
    if (!uploadURL || !uploadURL?.filePath) return;

    this.imgList = [...this.imgList, uploadURL?.filePath];
    viewer.updateIndex(this.imgList.length - 1);

    this.appService.showToastSubject.next({ msgLang: 'payment.transactionList.uploadSuc', successed: true });

    upload.clear();
  }

  /** 自定义上传验证 */
  customUploadValidator(): ValidatorFn {
    return () => (!(this.imgList && this.imgList?.length) ? { required: true } : null);
  }
}
