import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { SvgIconComponent } from 'angular-svg-icon';
import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { AttrDisabledDirective } from 'src/app/shared/directive/d-disabled.directive';
import { SelectMemberComponent } from 'src/app/pages/Bonus/coupon-manage/send-coupon/select-member/select-member.component';
import { MatModal, MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { AppService } from 'src/app/app.service';
import { MemberApi } from 'src/app/shared/api/member.api';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { DialogueImEditorComponent } from 'src/app/pages/session/dialogue/dialogue-im/dialogue-im-editor/dialogue-im-editor.component';
import { SessionApi } from 'src/app/shared/api/session.api';
import { SessionMsgTypeEnum, SessionSendEvent, TopicCategoryAll, TopicItem } from 'src/app/shared/interfaces/session';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { InputTrimDirective } from 'src/app/shared/directive/input.directive';
import { finalize } from 'rxjs';
import { TopicLabelComponent } from 'src/app/pages/session/components/topic-label/topic-label.component';
import { LangService } from 'src/app/shared/components/lang/lang.service';

@Component({
  selector: 'mass-msg',
  standalone: true,
  imports: [
    CommonModule,
    ModalTitleComponent,
    FormRowComponent,
    FormsModule,
    LangPipe,
    SvgIconComponent,
    UploadComponent,
    AttrDisabledDirective,
    ReactiveFormsModule,
    ModalFooterComponent,
    DialogueImEditorComponent,
    InputTrimDirective,
    TopicLabelComponent,
  ],
  templateUrl: './mass-msg.component.html',
  styleUrls: ['./mass-msg.component.scss'],
})
export class MassMsgComponent {
  private ls = inject(LocalStorageService);
  private api = inject(SessionApi);
  private memberApi = inject(MemberApi);
  private modalService = inject(MatModal);
  private appService = inject(AppService);
  public lang = inject(LangService);
  public modal = inject(MatModalRef<MassMsgComponent>);
  private fb = inject(FormBuilder);

  control = new FormControl(1);
  formGroup = this.fb.group({
    topicCategory: ['', Validators.required],
    topic: ['', Validators.required],
  });

  topicCategoryList: TopicCategoryAll[] = [];
  topicList: TopicItem[] = [];

  constructor() {
    this.appService.isContentLoadingSubject.next(true);
    this.api.getTopicAll().subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      this.topicCategoryList = res.data;
    });
  }

  /**
   * 指定用户输入类型
   */
  specifyUserInputType = [
    { name: '选择会员', value: 1, lang: 'member.coupon.model.chooseMember' },
    { name: '手动输入', value: 2, lang: 'member.coupon.model.manualEntry' },
    { name: '上传名单', value: 3, lang: 'member.coupon.model.uploadList' },
  ];

  /** 发送对象 - 手动选择会员UID */
  memberSelectedList: any[] = [];

  /** 发送对象 - 手动输入会员UID */
  memberManualRemark = '';

  /** 发送对象 - 上传会员UID */
  memberManualUploadList: { uid: string; userName: string }[] = [];

  tenantId = '';

  /**
   * 打开会员选择弹窗
   */
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

  /**
   * 发送对象 - 会员名单上传
   * @param file
   */
  customUpload = async (file /*{ done }*/) => {
    this.appService.isContentLoadingSubject.next(true);
    this.memberApi.messageBanList_import(file, this.tenantId).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      const isSuccess = Array.isArray(res);
      this.appService.showToastSubject.next({
        msgLang: isSuccess ? 'member.coupon.model.uploadSuccess' : 'member.coupon.model.uploadFailed',
        successed: isSuccess,
      });

      this.memberManualUploadList = res || [];
    });
  };

  /**
   * 发送对象 - 下载会员名单模板
   */
  downloadTemplate() {
    this.appService.isContentLoadingSubject.next(true);
    this.memberApi.messageBanList_download('imGroupSendTemplate').subscribe((isSuccess) => {
      this.appService.isContentLoadingSubject.next(false);

      this.appService.showToastSubject.next({
        msgLang: isSuccess ? 'member.coupon.model.downloadSuccessful' : 'member.coupon.model.downloadFailed',
        successed: isSuccess,
      });
    });
  }

  submit({ msg: content, data }: SessionSendEvent) {
    let uids = '';

    switch (this.control.value) {
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
      this.appService.showToastSubject.next({ msgLang: 'member.coupon.model.notDetectedInfo2' });
      return;
    }

    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid) return this.appService.showToastSubject.next({ msgLang: 'form.formInvalid' });

    this.appService.isContentLoadingSubject.next(true);
    this.api
      .batchSend(this.tenantId, {
        uids,
        adminUid: String(this.ls.userInfo.id), // 管理员UID
        content, // 消息内容
        createTime: Date.now(), // 消息时间
        msgType: SessionMsgTypeEnum.Mix, // 0:text、1:image、2:voice、3:video、4:music、5:news
        seq: `${this.tenantId}-${Math.random().toString().slice(-3)}-${Date.now()}`, // 消息序列号
        categoryId: this.formGroup.value.topicCategory!,
        subjectId: this.formGroup.value.topic!,
        ...data,
      })
      .pipe(finalize(() => this.appService.isContentLoadingSubject.next(false)))
      .subscribe(() => {
        this.appService.toastOpera(true);
        this.modal?.close(true);
      });
  }

  /**
   * 话题列表选择
   * @param item
   */
  onTopicCategory(item: TopicCategoryAll) {
    this.topicList = Array.isArray(item?.subjectList) ? item.subjectList : [];
    this.formGroup.controls.topic.reset('');
    // this.formGroup.controls.topic.updateValueAndValidity();
  }
}
