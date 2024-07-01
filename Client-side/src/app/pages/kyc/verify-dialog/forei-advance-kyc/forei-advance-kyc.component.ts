import { Component, Input, OnInit, WritableSignal, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatDialogRef } from '@angular/material/dialog';
import moment from 'moment';
import { Observable, filter } from 'rxjs';
import { KycApi } from 'src/app/shared/apis/kyc-basic.api';
import { ResourceApi } from 'src/app/shared/apis/resource.api';
import { KycAdvancedForEu, KycStatus } from 'src/app/shared/interfaces/kyc.interface';
import { ToastService } from 'src/app/shared/service/toast.service';
import { KycUtils } from '../../kyc-contants/kyc-utils';
import { KycService } from '../../kyc.service';
import { LocaleService } from './../../../../shared/service/locale.service';

@Component({
  selector: 'app-forei-advance-kyc',
  templateUrl: './forei-advance-kyc.component.html',
  styleUrls: ['./forei-advance-kyc.component.scss'],
})
export class ForeiAdvanceKycComponent implements OnInit {
  @Input() closeDialog: () => void;
  constructor(
    public dialogRef: MatDialogRef<ForeiAdvanceKycComponent>,
    private localeService: LocaleService,
    private toast: ToastService,
    private resourceApi: ResourceApi,
    private kycApi: KycApi,
    private kycService: KycService,
    public kycUtils: KycUtils
  ) {
    this.closeDialog = dialogRef.close.bind(dialogRef);
  }

  /** 获取用户kyc 名 */
  kycName!: string;

  /** 是否展示 上传文件区域 */
  isShowUpload: boolean = false;

  /** submitLoading */
  submitLoading: boolean = false;

  /** 是否已提交 */
  isSubmitted: WritableSignal<boolean> = signal(false);

  /** 锁住选择框 */
  isLocked: boolean = false;

  /** 所有KYC 状态 */
  kycStatus$: Observable<Array<KycStatus>> = toObservable(this.kycService._kycStatus).pipe(
    takeUntilDestroyed(),
    filter(v => v.length > 0)
  );

  ngOnInit(): void {
    this.kycStatus$.subscribe(kycStatus => {
      if (!this.isSubmitted()) return;
      if (kycStatus) {
        const advanceCreateTime = kycStatus?.find(item => item?.type === 'KycAdvanced')?.createTime;
        const formatDate = moment(advanceCreateTime).add(3, 'd').format('YYYY-MM-DD');
        this.submitLoading = false;
        //账户验证完成弹出框 升级审核中
        this.kycService.successPop(formatDate, () => {
          this.close();
        });
      }
    });
  }

  /**
   * 是否可以下一步
   *
   * @returns
   */
  get canNext(): boolean {
    return Object.values(this.kycUtils.userDocuments).filter(item => item.isSelected).length > 0;
  }

  /**
   * 是否可以提交表单
   *
   * @returns boolean
   */
  get canSubmit(): boolean {
    const selectedLength = Object.values(this.kycUtils.userDocuments).filter(item => item.isSelected).length;
    const uploadLength = Object.values(this.kycUtils.userDocuments).filter(
      item => item.isSelected && item.documents.uploads.length
    ).length;
    const loadingLen = Object.values(this.kycUtils.userDocuments).filter(item => item.documents.loading).length;
    return selectedLength === uploadLength && loadingLen === 0;
  }

  /**
   * 获取提交参数 KycAdvancedForEu
   *
   * @returns KycAdvancedForEu
   */
  get params(): KycAdvancedForEu {
    let params = {};
    Object.entries(this.kycUtils.userDocuments)
      .map(v => {
        if (v[1].isSelected) return { [v[0]]: v[1].documents.uploads.map(item => item.url) };
        return null;
      })
      .filter(v => v)
      .forEach(v => {
        params = {
          ...params,
          ...v,
        };
      });
    return { ...params } as KycAdvancedForEu;
  }

  /** 提交表单 */
  submit() {
    this.submitLoading = true;

    if (this.kycService.isSow) {
      this.kycApi
        .onUploadAdvanceSow({
          ...this.params,
          id: this.kycService.sowId,
        })
        .subscribe(data => {
          if (data) {
            this.isSubmitted.set(true);
            this.kycService._refreshKycStatus.set('fori-advance-kyc-sow');
          } else {
            this.isSubmitted.set(false);
            this.toast.show({ message: this.localeService.getValue('up_f'), type: 'fail' });
            this.close();
            this.submitLoading = false;
          }
        });
      return;
    }

    this.kycApi.onSubmitAdvanceKycEu(this.params).subscribe(data => {
      if (data) {
        this.isSubmitted.set(true);
        this.kycService._refreshKycStatus.set('fori-advance-kyc-submit');
      } else {
        this.isSubmitted.set(false);
        this.toast.show({ message: this.localeService.getValue('up_f'), type: 'fail' });
        this.close();
        this.submitLoading = false;
      }
    });
  }

  /**
   * 切换证明
   *
   * @param key
   */
  onChangeValue(key: string) {
    this.kycUtils.userDocuments[key].isSelected = !this.kycUtils.userDocuments[key].isSelected;
    this.kycUtils.userDocuments[key].documents.uploads = [];
    const len = Object.values(this.kycUtils.userDocuments).filter(item => item.isSelected).length;
    if (!len) {
      this.isShowUpload = false;
    }
  }

  /**
   * 移除图片
   *
   * @param item 数据
   * @param key 数据的值
   * @param index
   */
  removeItem(key: string, index: number) {
    const uploads = this.kycUtils.userDocuments[key].documents.uploads;
    uploads.splice(index, 1);
    this.kycUtils.userDocuments[key].documents.currentIndex = uploads.length - 1;
  }

  /**
   *  图片上传
   *
   * @param target
   * @param key
   * @returns
   */
  uploadImages(target: HTMLInputElement, key: string) {
    const file = target.files && target.files[0];
    if (!file) return;

    // 文件类型验证
    const fileType = file.type.toLowerCase();
    if (!['image/png', 'image/jpg', 'image/jpeg', 'application/pdf'].includes(fileType)) {
      this.toast.show({ message: this.localeService.getValue('unsupp_file'), type: 'fail', title: '' });
      target.value = '';
      return;
    }

    // 文件大小验证 10M
    const fileMaxSize = 1024 * 1024 * 10;
    if (file.size > fileMaxSize) {
      this.toast.show({ message: this.localeService.getValue('file_limerr'), type: 'fail', title: '' });
      target.value = '';
      return;
    }

    const docs = this.kycUtils.userDocuments[key].documents;
    //通过检验，开始上传
    docs.loading = true;
    this.isLocked = true;
    this.resourceApi.uploadFile(file, fileType, 'Kyc').subscribe(url => {
      if (url) {
        docs.uploads.push({ url, fileType: file });
        docs.currentIndex = docs.uploads.length - 1;
        this.toast.show({ message: this.localeService.getValue('up_img_s'), type: 'success', title: '' });
        target.value = '';
      } else {
        target.value = '';
        docs.loading = false;
        this.toast.show({ message: this.localeService.getValue('up_img_f'), type: 'fail', title: '' });
      }
    });
  }

  /**
   * 图片加载完成
   *
   * @param key
   */
  onLoad(key: string) {
    const docs = this.kycUtils.userDocuments[key].documents;
    docs.loading = false;
    this.isLocked = false;
  }

  /**
   * 关闭弹窗
   */
  close(): void {
    this.closeDialog();
    this.isSubmitted.set(false);
    this.kycService.isSow = false;
    this.kycService.sowId = 0;
    this.isLocked = false;
    Object.values(this.kycUtils.userDocuments).forEach(item => {
      item.documents.uploads = [];
      item.isSelected = false;
    });
  }
}
