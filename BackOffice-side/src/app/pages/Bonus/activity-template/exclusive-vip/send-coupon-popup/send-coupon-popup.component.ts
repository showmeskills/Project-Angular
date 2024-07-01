import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { AppService } from 'src/app/app.service';
import { MatModal, MatModalModule, MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';
import { SelectMemberComponent } from 'src/app/pages/Bonus/coupon-manage/send-coupon/select-member/select-member.component';
import { ActivityListItem } from 'src/app/shared/interfaces/activity';
import { ActivityAPI } from 'src/app/shared/api/activity.api';
import { SelectChannelComponent } from 'src/app/pages/Bonus/coupon-manage/send-coupon/select-channel/select-channel.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { AssetApi } from 'src/app/shared/api/asset.api';
import { UserAmountLimitData } from 'src/app/shared/interfaces/member.interface';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { InputTrimDirective } from 'src/app/shared/directive/input.directive';

@Component({
  selector: 'exclusive-vip-send-coupon-popup',
  templateUrl: './send-coupon-popup.component.html',
  styleUrls: ['./send-coupon-popup.component.scss'],
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
    CurrencyValuePipe,
    InputTrimDirective,
  ],
})
export class ExclusiveVipSendCouponPopupComponent implements OnInit {
  constructor(
    public modal: MatModalRef<ExclusiveVipSendCouponPopupComponent, boolean>,
    private modalService: MatModal,
    private appService: AppService,
    public lang: LangService,
    private api: ActivityAPI,
    private assetApi: AssetApi
  ) {}

  @Input() data?: ActivityListItem;

  @Input() tenantId;

  /** 玩家限制 - 当前发送对象值 */
  send = 1;
  /** 发送对象列表 */
  sendList = [
    { name: '选择会员', lang: 'member.coupon.model.chooseMember', value: 1 },
    { name: '选择会员渠道', lang: 'member.coupon.model.byMemberChannel', value: 2 },
    { name: '手动输入', lang: 'member.coupon.model.manualEntry', value: 3 },
    { name: '上传名单', lang: 'member.coupon.model.uploadList', value: 4 },
  ];

  /** 发送对象 - 手动选择会员UID */
  memberSelectedList: { uid: string; name: string; uact: string }[] = [];

  /** 发送对象 - 选择会员渠道UID */
  channelList: { uid: string; inviteCode: string; relationUidList: { name: string; uact: string }[] }[] = [];

  /** 发送对象 - 手动输入会员UID */
  memberManualRemark = '';

  /** 发送对象 - 上传会员UID */
  memberManualUploadList = [];

  /** 调账金额限制数据 */
  amountLimitData: UserAmountLimitData;

  ngOnInit() {
    // 获取当前操作者的余额限制
    this.getlimitdata();
  }

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

  /** 发送对象 - 选择会员渠道弹窗 */
  onMemberChannelPopup() {
    const modalRef = this.modalService.open(SelectChannelComponent, { width: '744px', disableClose: true });
    modalRef.componentInstance.selectSuccess.subscribe((list) => {
      const all = [...this.channelList, ...list];
      const res = new Map();
      this.channelList = all.filter((item) => !res.has(item['inviteCode']) && res.set(item['inviteCode'], 1));
    });
    modalRef.result.then(() => {}).catch(() => {});
  }

  /** 发送对象 - 会员名单上传 */
  customUpload = async (file /*{ done }*/) => {
    this.appService.isContentLoadingSubject.next(true);
    this.api.vipexclusive_import(file).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      this.appService.showToastSubject.next({
        msgLang: res?.code === '0000' ? 'member.coupon.model.uploadSuccess' : 'member.coupon.model.uploadFailed',
        successed: res?.code === '0000',
      });
      this.memberManualUploadList = res.data || [];
    });
  };

  /** 发送对象 - 下载会员名单模板 */
  downloadTemplate() {
    this.appService.isContentLoadingSubject.next(true);
    this.api.vipexclusive_download().subscribe((isSuccess) => {
      this.appService.isContentLoadingSubject.next(false);
      this.appService.showToastSubject.next({
        msgLang: isSuccess ? 'member.coupon.model.downloadSuccessful' : 'member.coupon.model.downloadFailed',
        successed: isSuccess,
      });
    });
  }

  /** 提交 */
  onSubmit() {
    let list;
    switch (this.send) {
      // 选择会员
      case 1:
        list = this.memberSelectedList.map((v) => ({ uid: v?.uid })) || [];
        break;
      // 选择会员渠道
      case 2:
        list =
          this.channelList.map((v) => ({
            agencyUid: v?.uid,
            referralCode: v?.inviteCode,
            users: v?.relationUidList.map((j) => ({ uid: j })),
          })) || [];
        break;
      // 手写会员
      case 3:
        list = this.memberManualRemark
          .split(';')
          .filter((v) => v)
          .map((v) => ({ uid: v }));
        break;
      // 上传会员
      case 4:
        list = this.memberManualUploadList || [];
        break;
    }

    if (!list.length) {
      // 未检测到发卷对象信息，请检查是否填写！
      this.appService.showToastSubject.next({ msgLang: 'member.coupon.model.notDetectedInfo' });
      return;
    }

    const commonParams = {
      tenantId: +this.tenantId,
      tmpId: this.data?.tmpId,
    };

    // 是否通过会员UID发送奖品
    const isSendUid = [1, 3, 4].includes(this.send);

    this.appService.isContentLoadingSubject.next(true);
    this.api[isSendUid ? 'vipexclusive_sendprizestousers' : 'vipexclusive_sendprizestoagency']({
      ...commonParams,
      ...(isSendUid ? { users: list } : { agencyUsers: list }),
    }).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      if (res?.code !== '0000')
        return this.appService.showToastSubject.next(
          res.message ? { msg: res.message } : { msgLang: 'member.activity.sencli16.failedToSend' }
        );
      this.appService.showToastSubject.next({ msgLang: 'member.activity.sencli16.sendSuccess', successed: true });
      this.modal?.dismiss();
    });
  }

  /**
   * 获取该管理后台账号调账限额
   */
  getlimitdata() {
    this.appService.isContentLoadingSubject.next(true);
    this.assetApi.getlimitdata('USDT').subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      if (res) this.amountLimitData = res;
    });
  }
}
