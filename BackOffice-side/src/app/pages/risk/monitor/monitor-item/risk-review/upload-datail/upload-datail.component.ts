import { Component, Input, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { KycApi } from 'src/app/shared/api/kyc.api';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { MemberApi } from 'src/app/shared/api/member.api';
import { MonitorApi } from 'src/app/shared/api/monitor.api';
import { zip } from 'rxjs';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { FormsModule } from '@angular/forms';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { NzImageDirective } from 'src/app/shared/components/image/image.directive';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MatTabsModule } from '@angular/material/tabs';
import { NgIf, NgFor } from '@angular/common';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
@Component({
  selector: 'app-upload-datail',
  templateUrl: './upload-datail.component.html',
  styleUrls: ['./upload-datail.component.scss'],
  standalone: true,
  imports: [
    ModalTitleComponent,
    NgIf,
    MatTabsModule,
    NgFor,
    AngularSvgIconModule,
    NzImageDirective,
    FormRowComponent,
    FormsModule,
    TimeFormatPipe,
    LangPipe,
  ],
})
export class UploadDatailComponent implements OnInit {
  constructor(
    public modal: MatModalRef<UploadDatailComponent>,
    private appService: AppService,
    private api: KycApi,
    public lang: LangService,
    private memberApi: MemberApi,
    private monitorApi: MonitorApi
  ) {}

  isLoading = false;

  currentTabValue: any = 0; // 当前选中
  tabs = [
    { name: '基础', lang: 'member.kyc.basis', value: 0 },
    { name: '中级', lang: 'member.kyc.middle', value: 1 },
    { name: '高级', lang: 'member.kyc.adv', value: 2 },
    { name: '上传指定文件', lang: 'risk.uploadSpecified', value: 3 },
  ];

  auditList: any[] = [
    { name: '通过', lang: 'risk.passing', value: 'Finish' },
    { name: '不通过', lang: 'risk.noPass', value: 'Rejected' },
    // { name: '待补充资料', lang: 'risk.toBeSupplemented', value: 'Processing' },
  ];

  data: any;
  audit: any = 'Finish';
  remark: any = '';
  btnFlag = false;
  userDetailsInfo: any = [];
  @Input() tenantId: any = 1;
  @Input() dataList: any = [];

  ngOnInit() {
    this.getList();
  }

  changeTab(value: any) {
    this.currentTabValue = value;
    if (value !== 3) {
      this.getList();
    }
  }

  getList() {
    this.loading(true);
    zip([
      // 3136
      this.memberApi.getMemberOverView({ memberId: this.dataList.mid }),
      this.api.postProcessEntitiesDetail(this.currentTabValue, this.dataList.uid),
    ]).subscribe(([userDetailsInfo, keyList]) => {
      this.userDetailsInfo = userDetailsInfo || [];
      this.data = keyList || [];
      this.loading(false);
    });
  }

  getIdText(type: any): any {
    const text: any = new Map([
      ['ID_CARD', '身份证'],
      ['DRIVING LICENSE', '行驶证'],
      ['PASSPORT', '护照'],
      ['VISA', '签证'],
    ]);
    return text.get(type) || '-';
  }

  getImage(image: any) {
    if (!image) return [];
    return image.substr(0, 4) == 'http' || image.substr(0, 5) == 'https' ? image : 'data:image/png;base64,' + image;
  }

  /** 加载状态 */
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  /**审核上传 */
  review() {
    if (this.audit === 'Rejected' && !this.remark) {
      this.appService.showToastSubject.next({
        msgLang: 'risk.fillRemarks', // 备注为必填项
        successed: false,
      });
      return;
    }
    if (this.dataList?.status === 'Pending' && this.currentTabValue === 3) {
      this.loading(true);
      this.monitorApi
        .auditRiskForm({ id: this.dataList.id, status: this.audit, remark: this.remark })
        .subscribe((res) => {
          this.appService.showToastSubject.next({
            msgLang: res ? 'risk.suc' : 'risk.fail', //发起验证提示语
            successed: res,
          });
          this.loading(false);
          this.modal.close(true);
        });
    } else {
      this.modal.close();
    }
  }
}
