import { Component, Input, OnInit } from '@angular/core';
import { KycAdvanced, Sow } from 'src/app/shared/interfaces/risk-control.interface';
import { KycDialogService } from 'src/app/shared/service/kyc-dialog.service';
import { KycUtils } from '../../../kyc-contants/kyc-utils';
import { KycService } from '../../../kyc.service';

@Component({
  selector: 'app-advance-kyc-docs',
  templateUrl: './advance-kyc-docs.component.html',
  styleUrls: ['./advance-kyc-docs.component.scss'],
})
export class AdvanceKycDocs implements OnInit {
  constructor(public kycUtils: KycUtils, private kycService: KycService, private kycDialogService: KycDialogService) {}

  /** 高级 已提交过的材料 */
  @Input() sow!: Sow;

  @Input() kycAdvanced!: KycAdvanced | null | undefined;

  ngOnInit() {}

  /**
   * 补充材料
   */
  handleUploadDocs() {
    this.kycService.isAllowAdvancedEu = true;
    this.kycService.isSow = true;
    this.kycService.sowId = this.sow.id;
    this.kycDialogService.openVerifyDialog(5);
  }

  /**
   * 获取图片名称
   *
   * @param value
   * @returns
   */
  getPicName(value: string): string {
    if (!value) return '';
    return value.split('/')?.pop() || '';
  }
}
