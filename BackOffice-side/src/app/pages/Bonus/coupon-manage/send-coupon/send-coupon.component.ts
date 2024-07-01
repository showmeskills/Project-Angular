import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { BonusCouponApi } from 'src/app/shared/api/bonus-coupon.api';
import { MatModal, MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { SelectMemberComponent } from './select-member/select-member.component';
import { SelectChannelComponent } from './select-channel/select-channel.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { AssetApi } from 'src/app/shared/api/asset.api';
import { UserAmountLimitData } from 'src/app/shared/interfaces/member.interface';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { InputTrimDirective } from 'src/app/shared/directive/input.directive';

@Component({
  selector: 'app-send-coupon',
  templateUrl: './send-coupon.component.html',
  styleUrls: ['./send-coupon.component.scss'],
  standalone: true,
  imports: [
    AngularSvgIconModule,
    FormRowComponent,
    NgFor,
    FormsModule,
    NgIf,
    UploadComponent,
    FormatMoneyPipe,
    LangPipe,
    CurrencyValuePipe,
    InputTrimDirective,
  ],
})
export class SendCouponComponent implements OnInit {
  @Input() data: any;
  @Input() tenantId;

  @Output() sendSuccess = new EventEmitter();

  constructor(
    public modal: MatModalRef<SendCouponComponent, boolean>,
    private modalService: MatModal,
    private appService: AppService,
    private api: BonusCouponApi,
    public lang: LangService,
    private assetApi: AssetApi
  ) {}

  isLoading = false;

  send = 1;
  sendList: any = [
    { name: 'member.coupon.model.chooseMember', value: 1 },
    { name: 'member.coupon.model.byMemberChannel', value: 2 },
    // 手动输入
    { name: 'member.coupon.model.manualEntry', value: 3 },
    // 上传名单
    { name: 'member.coupon.model.uploadList', value: 4 },
  ];

  // 会员
  memberList: any[] = [];

  // 渠道
  channelList: any[] = [];

  // 手动输入
  memberManualRemark = '';

  // 上传名单
  memberManualUpload = '';

  // 调账金额限制
  amountLimitData: UserAmountLimitData;

  customUpload = async (file /*{ done }*/) => {
    this.loading(true);
    const uploadSuccess = await this.lang.getOne('member.coupon.model.uploadSuccess');
    const uploadFaile = await this.lang.getOne('member.coupon.model.uploadFailed');
    this.api.uploadfile(file).subscribe((res) => {
      this.loading(false);
      if (res?.code === '0000') {
        this.appService.showToastSubject.next({
          msg: uploadSuccess,
          successed: true,
        });
        if (res.data.length > 0) this.memberManualUpload = res.data.map((v) => v.uid).join(';');
      } else {
        this.appService.showToastSubject.next({
          msg: uploadFaile,
          successed: false,
        });
      }
    });
  };

  ngOnInit() {
    // 如果是现金券，就显示可用的金额额度
    if (this.data?.voucherType === 1 && this.data?.currency) this.getlimitdata();
  }

  /**
   * 获取该管理后台账号调账限额
   */
  getlimitdata() {
    this.loading(true);
    this.assetApi.getlimitdata(this.data?.currency).subscribe((res) => {
      this.loading(false);
      if (res) this.amountLimitData = res;
    });
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  // 下载模板
  async downloadTemplate() {
    this.loading(true);
    const downloadSuccessful = await this.lang.getOne('member.coupon.model.downloadSuccessful');
    const downloadFailed = await this.lang.getOne('member.coupon.model.downloadFailed');
    this.api.downloadUploadTemplate().subscribe((isSuccess) => {
      this.loading(false);
      this.appService.showToastSubject.next({
        msg: isSuccess ? downloadSuccessful : downloadFailed,
        successed: isSuccess,
      });
    });
  }

  async sendCoupon() {
    const params: any = {
      tenantId: +this.tenantId,
      tmpId: this.data.id,
      users: [],
    };
    const channelParams: any = {
      tenantId: +this.tenantId,
      tmpId: this.data.id,
      agencys: [],
    };

    //选择会员
    if (this.send === 1) {
      params.users = this.memberList.map((v) => ({ uid: v.uid, uact: v.name }));
    }
    // 按照会员渠道
    if (this.send === 2) {
      channelParams.agencys = this.channelList.map((v) => ({
        agencyUid: v.uid,
        referralCode: v.inviteCode,
        userDtos: v.relationUidList.map((j) => ({ uid: j, uact: '' })),
      }));
    }
    // 手动输入
    if (this.send === 3) {
      // 手动输入
      this.memberManualRemark &&
        this.memberManualRemark
          .split(';')
          .filter((j) => j)
          .forEach((v) => {
            params.users.push({ uid: v, uact: '' });
          });
    }
    // 上传名单
    if (this.send === 4) {
      this.memberManualUpload &&
        this.memberManualUpload
          .split(';')
          .filter((j) => j)
          .forEach((v) => {
            params.users.push({ uid: v, uact: '' });
          });
    }

    // send === 2 -> 派发代理
    if (this.send === 2) {
      if (!channelParams.agencys.length) {
        // '未检测到发卷对象信息，请检查是否填写！'
        const msg = await this.lang.getOne('member.coupon.model.notDetectedInfo');
        this.appService.showToastSubject.next({
          msg,
          successed: false,
        });
        return;
      }
      this.loading(true);
      this.api.getCouponAgencySend(channelParams).subscribe(async (res) => {
        this.loading(false);
        if (res.code === '0000') {
          const msg = await this.lang.getOne('member.coupon.model.coupSentSuc');
          this.appService.showToastSubject.next({
            msg: res?.message || msg,
            successed: true,
          });
          this.modal.close(true);
          this.sendSuccess.emit();
        } else {
          // '发送优惠卷失败！'
          const sendFail = await this.lang.getOne('member.coupon.model.sendFail');
          this.appService.showToastSubject.next({
            msg: res?.message || sendFail,
            successed: false,
          });
        }
      });
    } else {
      if (!params.users.length) {
        // '未检测到发卷对象信息，请检查是否填写！'
        const msg = await this.lang.getOne('member.coupon.model.notDetectedInfo');
        this.appService.showToastSubject.next({
          msg,
          successed: false,
        });
        return;
      }
      this.loading(true);
      this.api.getCouponSend(params).subscribe(async (res) => {
        this.loading(false);
        if (res.code === '0000') {
          const msg = await this.lang.getOne('member.coupon.model.coupSentSuc');
          this.appService.showToastSubject.next({
            msg: res?.message || msg,
            successed: true,
          });
          this.modal.close(true);
          this.sendSuccess.emit();
        } else {
          // '发送优惠卷失败！'
          const sendFail = await this.lang.getOne('member.coupon.model.sendFail');
          this.appService.showToastSubject.next({
            msg: res?.message || sendFail,
            successed: false,
          });
        }
      });
    }
  }

  onMemberPopup() {
    const modalRef = this.modalService.open(SelectMemberComponent, { width: '744px', disableClose: true });
    modalRef.componentInstance['tenantId'] = this.tenantId;

    modalRef.componentInstance.selectSuccess.subscribe((list) => {
      const all = [...this.memberList, ...list];
      // 1.对象数组去重
      const res = new Map();
      this.memberList = all.filter((item) => !res.has(item['uid']) && res.set(item['uid'], 1));
      // 2.对象数组去重
      // let hash = {};
      // this.memberList = all.reduce((prev, item) => {
      //   hash[item['uid']] ? '' : (hash[item['uid']] = true && prev.push(item));
      //   return prev;
      // }, []);
    });
    modalRef.result.then(() => {}).catch(() => {});
  }

  onMemberChannelPopup() {
    const modalRef = this.modalService.open(SelectChannelComponent, { width: '744px', disableClose: true });
    modalRef.componentInstance.selectSuccess.subscribe((list) => {
      const all = [...this.channelList, ...list];
      const res = new Map();
      this.channelList = all.filter((item) => !res.has(item['inviteCode']) && res.set(item['inviteCode'], 1));
    });
    modalRef.result.then(() => {}).catch(() => {});
  }
}
