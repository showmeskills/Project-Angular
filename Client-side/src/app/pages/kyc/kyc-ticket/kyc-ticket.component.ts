import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { KycLevelTye, KycStatus, ProcessDetailForEu } from 'src/app/shared/interfaces/kyc.interface';
import { RequestDocumentDataCallBack } from 'src/app/shared/interfaces/risk-control.interface';
import { KycDialogService } from 'src/app/shared/service/kyc-dialog.service';
import { CardInfoConfig } from '../kyc-contants/kyc-utils';
import { KycService } from '../kyc.service';
import { VerifyDialogComponent } from '../verify-dialog/verify-dialog.component';

@Component({
  selector: 'app-kyc-ticket',
  templateUrl: './kyc-ticket.component.html',
  styleUrls: ['./kyc-ticket.component.scss'],
})
export class KycTicketComponent implements OnInit, OnChanges {
  constructor(private dialog: MatDialog, public kycService: KycService, private kycDialogService: KycDialogService) {}

  @Input() cardConfig!: CardInfoConfig;
  /** 用户区分欧洲和亚洲 */
  @Input() isAsia!: boolean;
  /** 欧洲 中级的kyc 详情 */
  @Input() midProcessDetailForEu?: ProcessDetailForEu;
  /** 补充材料 */
  @Input() requestDocumentsInfor?: RequestDocumentDataCallBack;
  /** 用户KYC 所有状态 */
  @Input() kycStatus?: KycStatus[] = [];

  buttonText: string = '';
  btnClass: string = '';

  /**显示补充多文件 */
  showDocument: boolean = false;

  /** 当前补充资料 Kyc等级 */
  currentSupplymentaryKycLevel: Array<KycLevelTye> = [];

  ngOnInit() {}

  ngOnChanges(_: SimpleChanges): void {
    if (this.cardConfig) {
      this.buttonText = this.cardConfig?.btnStyle?.buttonText || '';
      this.btnClass = this.cardConfig?.btnStyle?.btnClass || '';
    }

    if (this.requestDocumentsInfor) {
      const currentSupplymentaryKycLevel = this.kycService.formatRequestDocumentsList(this.requestDocumentsInfor);
      if (currentSupplymentaryKycLevel) {
        this.showDocument = true;
        this.currentSupplymentaryKycLevel = currentSupplymentaryKycLevel;
      }
    }
  }

  /**
   * 认证按钮
   *
   * @param midProcessDetailForEu
   */
  handleApprove(midProcessDetailForEu?: ProcessDetailForEu) {
    const idFileStatus: number | null = midProcessDetailForEu?.userInfo?.idFileStatus || null;
    const poaFileStatus: number | null = midProcessDetailForEu?.userInfo?.poaFileStatus || null;
    const primary = this.kycStatus?.find(item => item?.type === 'KycPrimary');
    const intermediate = this.kycStatus?.find(item => item?.type === 'KycIntermediat');
    const advance = this.kycStatus?.find(item => item?.type === 'KycAdvanced');

    // 初级验证
    if (primary && primary['status'] !== 'S') {
      this.openVerifyDialog(1);
      return;
    }

    //中级验证 未做过 中级
    if (!intermediate) {
      this.openVerifyDialog(3);
      return;
    }

    // 已经做过中级 但是未通过 欧洲
    if (intermediate && intermediate['status'] !== 'S') {
      if (this.isAsia) {
        this.openVerifyDialog(3);
      } else {
        this.kycService.euMidFailedProcess(idFileStatus, poaFileStatus);
      }
      return;
    }

    // 做高级验证
    if (!advance || (advance && advance['status'] !== 'S')) {
      this.openVerifyDialog(5);
    }
  }

  /**
   * 验证弹出框
   *
   * @param step
   */
  openVerifyDialog(step: number): MatDialogRef<VerifyDialogComponent> {
    return this.dialog.open(VerifyDialogComponent, {
      panelClass: 'custom-dialog-container',
      autoFocus: false,
      disableClose: true,
      id: 'kyc-dialog',
      data: { step },
    });
  }

  /**
   * poa和Id 的验证弹框
   *
   * @param status
   * @param intermediateStatus
   * @param midProcessDetailForEu 中级欧洲 提交后材料获取的状态
   * @returns
   */
  openVerify(status: string | null, intermediateStatus: string, midProcessDetailForEu: ProcessDetailForEu) {
    const idFileStatus: number | null = midProcessDetailForEu?.userInfo?.idFileStatus || null;
    const poaFileStatus: number | null = midProcessDetailForEu?.userInfo?.poaFileStatus || null;
    if (status && status !== 'R') return;

    if ((status === 'R' || status === null) && intermediateStatus === 'P') return;

    this.kycService.euMidFailedProcess(idFileStatus, poaFileStatus);
  }

  /**打开补充文件 ID POA*/
  handleAddDocument(item: any) {
    if (item.status == 'Pending' || item.status == 'Finish') {
      return;
    }
    // 补充材料流程
    if (item.type == 'ID') {
      this.kycDialogService.openAddDocuments(item.type);
    } else if (item.type == 'POA') {
      this.kycDialogService.openAddDocuments(item.type);
    } else {
      this.kycService.handleNeedMoreDocuments(item);
    }
  }
}
