import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { KycMemberLimit, KycStatus, ProcessDetailForEu } from 'src/app/shared/interfaces/kyc.interface';
import { RequestDocumentDataCallBack } from 'src/app/shared/interfaces/risk-control.interface';
import { CardInfoConfig } from '../../kyc-contants/kyc-utils';

@Component({
  selector: 'app-kyc-h5',
  templateUrl: './kyc-h5.component.html',
  styleUrls: ['./kyc-h5.component.scss'],
})
export class KycH5Component implements OnInit, OnChanges {
  constructor() {}

  @Input() pagesConfig!: CardInfoConfig[];
  @Input() noticeContants!: KycMemberLimit;

  /** 欧洲 中级的kyc 详情 */
  @Input() midProcessDetailForEu?: ProcessDetailForEu;
  /** 补充材料 */
  @Input() requestDocumentsInfor?: RequestDocumentDataCallBack;
  /**是否为亚洲用户 */
  @Input() isAsia!: boolean;
  /** 用户KYC 所有状态 */
  @Input() kycStatus?: KycStatus[] = [];

  /**显示hover提示*/
  showNotice: boolean = false;
  /**显示hover提示 */
  showRightsNotice: boolean = false;
  isH5!: boolean;
  isShow: boolean = false;
  configValue!: CardInfoConfig[];
  /**当前选择 0:初级 1:中级 2:高级 */
  selectedTabIndex: number = 0;

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.pagesConfig?.currentValue) {
      this.configValue = this.pagesConfig.map(item => ({
        ...item,
        buttonText: item.btnStyle?.buttonText,
        btnClass: item.btnStyle?.btnClass,
      }));
      this.isShow = true;
    }
  }
}
