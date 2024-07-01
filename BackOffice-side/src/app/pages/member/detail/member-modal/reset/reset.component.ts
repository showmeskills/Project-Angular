import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { AssetApi } from 'src/app/shared/api/asset.api';
import { ZoneApi } from 'src/app/shared/api/zone.api';
import { MatModal, MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { FormValidator } from 'src/app/shared/form-validator';
import { lastValueFrom } from 'rxjs';
import { AreaSelectComponent } from './area-select/area-select.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import {
  ModalFooterComponent,
  DismissCloseDirective,
} from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgIf } from '@angular/common';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';

@Component({
  selector: 'reset',
  templateUrl: './reset.component.html',
  standalone: true,
  imports: [
    ModalTitleComponent,
    FormRowComponent,
    FormsModule,
    NgIf,
    ReactiveFormsModule,
    AngularSvgIconModule,
    UploadComponent,
    ModalFooterComponent,
    DismissCloseDirective,
    LangPipe,
  ],
})
export class ResetComponent implements OnInit {
  constructor(
    public modal: MatModalRef<ResetComponent>,
    private api: AssetApi,
    private zoneApi: ZoneApi,
    private appService: AppService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private modalService: MatModal
  ) {
    const { uid } = this.route.snapshot.queryParams;
    this.uid = uid;
  }

  formGroup!: FormGroup;
  validator!: FormValidator;
  isLoading = false;

  resetType: any = 1;

  uid: any = '';
  areaCode: any = '+86';
  unBindUid: any = '';
  image: any = '';

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      newPhoneNum: ['', Validators.required],
    });
    this.validator = new FormValidator(this.formGroup);
  }

  onOpenArea() {
    this.loading(true);
    this.zoneApi.getCountries().subscribe((res) => {
      this.loading(false);
      if (res && res.length > 0) {
        const modalRef = this.modalService.open(AreaSelectComponent, { width: '440px', disableClose: true });
        modalRef.componentInstance['data'] = res;

        modalRef.componentInstance.confirm.subscribe((code: any) => (this.areaCode = code));
        modalRef.result.then(() => {}).catch(() => {});
      } else {
        this.appService.showToastSubject.next({
          msg: '获取国家数据失败，请重新点击！',
          successed: false,
        });
      }
    });
  }

  /** methods */
  async onConfirm() {
    this.formGroup.markAllAsTouched(); // 手动执行验证
    if (this.formGroup.invalid) return;

    this.loading(true);
    const res = await lastValueFrom(
      this.api.checkMobileExist({
        uid: this.uid,
        areaCode: this.areaCode,
        mobile: this.formGroup.value.newPhoneNum,
      })
    );
    this.loading(false);
    if (res.error) return this.appService.showToastSubject.next({ msg: '手机号码检查请求失败，无法正常重置操作！' });
    if (res === true && !this.unBindUid)
      return this.appService.showToastSubject.next({ msg: '手机号码已被绑定，请输入被绑定的UID进行解绑！' });

    this.loading(true);
    const params = {
      uid: this.uid,
      areaCode: this.areaCode,
      mobile: this.formGroup.value.newPhoneNum,
      unBindUid: this.unBindUid,
      attachmentList: [this.image],
    };
    this.api.myAddResetBindMobile(params).subscribe((res) => {
      this.loading(false);
      if (res === true) this.modal.close(true);
      this.appService.showToastSubject.next({
        msg: res === true ? '手机号码重置成功' : '手机号码重置失败',
        successed: res === true ? true : false,
      });
    });
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }
}
