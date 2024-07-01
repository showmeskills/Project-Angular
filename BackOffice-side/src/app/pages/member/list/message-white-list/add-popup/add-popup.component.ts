import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { AppService } from 'src/app/app.service';
import { SelectMemberComponent } from 'src/app/pages/Bonus/coupon-manage/send-coupon/select-member/select-member.component';
import { MemberApi } from 'src/app/shared/api/member.api';
import { MatModalModule, MatModalRef, MatModal } from 'src/app/shared/components/dialogs/modal';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';
import { InputTrimDirective } from 'src/app/shared/directive/input.directive';

@Component({
  selector: 'message-white-list-add-popup',
  templateUrl: './add-popup.component.html',
  styleUrls: ['./add-popup.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatModalModule,
    FormsModule,
    MatOptionModule,
    LangPipe,
    LoadingDirective,
    UploadComponent,
    AngularSvgIconModule,
    InputTrimDirective,
  ],
})
export class MessageWhiteListAddPopupComponent implements OnInit {
  constructor(
    public modal: MatModalRef<MessageWhiteListAddPopupComponent, boolean>,
    private modalService: MatModal,
    private appService: AppService,
    public lang: LangService,
    private api: MemberApi
  ) {}

  @Input() tenantId;

  /** 当前发送对象值 */
  send = 1;
  /** 发送对象列表 */
  sendList = [
    { name: '选择会员', lang: 'member.coupon.model.chooseMember', value: 1 },
    { name: '手动输入', lang: 'member.coupon.model.manualEntry', value: 2 },
    { name: '上传名单', lang: 'member.coupon.model.uploadList', value: 3 },
  ];

  /** 发送对象 - 手动选择会员UID */
  memberSelectedList: { uid: string; name: string; uact: string }[] = [];

  /** 发送对象 - 手动输入会员UID */
  memberManualRemark = '';

  /** 发送对象 - 上传会员UID */
  memberManualUploadList: { uid: string; userName: string }[] = [];

  ngOnInit() {}

  /** 发送对象 - 选择会员弹窗 */
  onOpenMemberSelectPopup() {
    const modalRef = this.modalService.open(SelectMemberComponent, { width: '744px', disableClose: true });
    modalRef.componentInstance['tenantId'] = this.tenantId;

    modalRef.componentInstance.selectSuccess.subscribe((list) => {
      const all = [...this.memberSelectedList, ...list];
      // 对象数组去重
      const res = new Map();
      this.memberSelectedList = all.filter((item) => !res.has(item['uid']) && res.set(item['uid'], 1));
    });

    modalRef.result.then(() => {}).catch(() => {});
  }

  /** 发送对象 - 会员名单上传 */
  customUpload = async (file /*{ done }*/) => {
    this.appService.isContentLoadingSubject.next(true);
    this.api.messageBanList_import(file, this.tenantId).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      const isSuccess = Array.isArray(res);
      this.appService.showToastSubject.next({
        msgLang: isSuccess ? 'member.coupon.model.uploadSuccess' : 'member.coupon.model.uploadFailed',
        successed: isSuccess,
      });

      this.memberManualUploadList = res || [];
    });
  };

  /** 发送对象 - 下载会员名单模板 */
  downloadTemplate() {
    this.appService.isContentLoadingSubject.next(true);
    this.api.messageBanList_download('banListTemplate').subscribe((isSuccess) => {
      this.appService.isContentLoadingSubject.next(false);

      this.appService.showToastSubject.next({
        msgLang: isSuccess ? 'member.coupon.model.downloadSuccessful' : 'member.coupon.model.downloadFailed',
        successed: isSuccess,
      });
    });
  }

  /** 提交 */
  onSubmit() {
    let uids;

    switch (this.send) {
      // 选择会员
      case 1:
        uids = this.memberSelectedList.map((v) => v.uid).join(';') || '';
        break;
      // 手写会员
      case 2:
        uids = this.memberManualRemark;
        break;
      // 上传会员
      case 3:
        uids = this.memberManualUploadList.map((v) => v.uid).join(';') || '';
        break;
    }

    if (!uids) {
      // 未检测到发送对象信息，请检查是否填写！
      this.appService.showToastSubject.next({ msgLang: 'member.coupon.model.notDetectedInfo' });
      return;
    }

    this.appService.isContentLoadingSubject.next(true);
    this.api.addMessageWhiteList({ uids, tenantId: this.tenantId }).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      if (res?.code !== '0')
        return this.appService.showToastSubject.next(
          res.message ? { msg: res.message } : { msgLang: 'common.operationFailed' }
        );

      this.appService.showToastSubject.next({ msgLang: 'common.sucOperation', successed: true });
      this.modal?.close(true);
    });
  }
}
