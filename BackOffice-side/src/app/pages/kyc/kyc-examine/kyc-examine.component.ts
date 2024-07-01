import { Component, OnInit, TemplateRef } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { finalize, Subject, takeUntil } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { KycApi } from 'src/app/shared/api/kyc.api';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { NzImageDirective } from 'src/app/shared/components/image/image.directive';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { FormsModule } from '@angular/forms';
import { cloneDeep } from 'lodash';
import { ExcelFormat, JSONToExcelDownload, timeFormat, toDateStamp } from 'src/app/shared/models/tools.model';
import { KYCProcessItem, KYCProcessParams } from 'src/app/shared/interfaces/kyc';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker';
import { InputTrimDirective } from 'src/app/shared/directive/input.directive';

@Component({
  selector: 'app-kyc-examine',
  templateUrl: './kyc-examine.component.html',
  styleUrls: ['./kyc-examine.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    NgFor,
    NgIf,
    LabelComponent,
    AngularSvgIconModule,
    PaginatorComponent,
    NzImageDirective,
    NgClass,
    LangPipe,
    InputTrimDirective,
    TimeFormatPipe,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    InputTrimDirective,
  ],
})
export class KycExamineComponent implements OnInit {
  constructor(
    public modal: NgbModal,
    private appService: AppService,
    private api: KycApi,
    public subHeaderService: SubHeaderService,
    public lang: LangService
  ) {}

  list: KYCProcessItem[] = [];
  _destroyed: any = new Subject<void>();
  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  isLoading = false;
  radioData: any = {};
  radioDataEmpty: any = {
    radioType: 1,
    radioText: '',
    fullName: '',
    firstName: '',
    lastName: '',
  };

  activeTabIndex = 0;
  kycTypeTpl = 0;
  activeImg: any = '';
  tenantId: any = '1'; // 商户id
  tenantName: any = '1'; // 商户名称

  private readonly EMPTY_DATA = {
    uid: '',
    processState: '', // 审核状态
    certification: '', // 认证类型
    updateTime: [], // 更新时间
  };

  searchData = cloneDeep(this.EMPTY_DATA);

  onExamineDate: any = {};
  onDetailDate: any = {};
  onDetailDate_image: any = {
    frontsideImage: '',
    backsideImage: '',
  };

  onThirdDetailDate: any = {};
  birthDay: any = '';
  tabs = [
    { name: 'member.kyc.basis' },
    { name: 'member.kyc.middle' },
    { name: 'member.kyc.adv' },
    { name: 'member.kyc.model.livingBody' },
  ];

  get isJumio() {
    return this.onExamineDate?.kycThirdCode === 'Jumio' ? true : false;
  }

  get isFullName() {
    return ['CHN', 'HKG', 'TWN', 'MAC', 'VNM', 'THA', 'MYS'].includes(this.onExamineDate?.kycArea) ? true : false;
  }

  ngOnInit(): void {
    this.subHeaderService.merchantId$.pipe(takeUntil(this._destroyed)).subscribe(() => {
      this.loadData();
    });
  }

  loadData(resetPage = false) {
    if (this.isLoading) return;

    resetPage && (this.paginator.page = 1);
    this.loadData$().subscribe((res) => {
      this.list = res?.pageData || [];
      this.paginator.total = res.rowCount;
    });
  }

  loadData$(data?: KYCProcessParams) {
    // 没有商户
    if (!this.subHeaderService.merchantCurrentId) {
      this.appService.showToastSubject.next({ msgLang: 'conten.chooseMer' });
      throw Error('没有商户ID');
    }
    this.loading(true);
    //取到商户id并转换类型
    this.tenantId = String(this.subHeaderService.merchantCurrentId);
    this.tenantName = this.subHeaderService.merchantList.find((e) => e.value == this.tenantId);

    return this.api
      .postProcessNormal({
        size: this.paginator.pageSize,
        page: this.paginator.page,
        uid: this.searchData.uid.trim() || undefined,
        processState: this.searchData.processState || undefined,
        kycType: this.searchData.certification === '0' ? 0 : +this.searchData.certification || undefined,
        updateTimestampStart: toDateStamp(this.searchData.updateTime[0], false) || undefined,
        updateTimestampEnd: toDateStamp(this.searchData.updateTime[1], true) || undefined,
        ...data,
      })
      .pipe(
        finalize(() => {
          this.loading(false);
        })
      );
  }

  async onExamine(detailTpl: TemplateRef<any>, item: any) {
    this.radioData = { ...this.radioDataEmpty };
    this.onExamineDate = item;
    this.onItemDetailDate(item.id);
    this.modal.open(detailTpl, {
      centered: true,
      windowClass: 'kyc-option-examinel-modal',
    });
  }

  async onUpdateExamine(closeModal: any) {
    const successMsg = await this.lang.getOne('member.kyc.model.successOperation');
    const failMsg = await this.lang.getOne('risk.config.fail');

    const params = {
      id: this.onExamineDate.id,
      processState: this.radioData.radioType,
      ...(this.radioData.radioText && this.radioData.radioType === 1 ? { auditInfo: this.radioData.radioText } : {}),
      ...(this.radioData.radioType === 2
        ? this.isFullName
          ? { fullName: this.radioData.fullName }
          : { firstName: this.radioData.firstName, lastName: this.radioData.lastName }
        : {}),
    };

    this.loading(true);
    this.api.postProcessAudit(params, this.onDetailDate?.uid || this.onExamineDate?.uid).subscribe((res) => {
      this.loading(false);
      this.loadData();
      closeModal();

      this.appService.showToastSubject.next({
        msg: ['Approved', 'Rejected'].includes(res?.msg) ? successMsg : res?.status?.errorData || failMsg,
        successed: ['Approved', 'Rejected'].includes(res?.msg) ? true : false,
      });
    });
  }

  onItemDetailDate(id: any) {
    this.onDetailDate = {};
    this.loading(true);
    const params = {
      processId: id,
    };
    this.api.postProcessDetail(params).subscribe((res) => {
      this.loading(false);
      this.onDetailDate = res.pojo;
      this.birthDay = res.birthDay;

      if (!this.onDetailDate.frontsideImage) {
        this.onDetailDate_image.frontsideImage = '';
      } else if (this.onDetailDate.frontsideImage.substr(0, 4) == 'http') {
        this.onDetailDate_image.frontsideImage = this.onDetailDate.frontsideImage;
      } else {
        this.onDetailDate_image.frontsideImage = 'data:image/png;base64,' + this.onDetailDate.frontsideImage;
      }

      if (!this.onDetailDate.backsideImage) {
        this.onDetailDate_image.backsideImage = '';
      } else if (this.onDetailDate.backsideImage.substr(0, 4) == 'http') {
        this.onDetailDate_image.backsideImage = this.onDetailDate.backsideImage;
      } else {
        this.onDetailDate_image.backsideImage = 'data:image/png;base64,' + this.onDetailDate.backsideImage;
      }
    });
  }

  onItemThirdDetail(id: any) {
    this.onThirdDetailDate = {};
    this.activeImg = '';
    this.loading(true);
    const params = {
      processId: id,
    };
    this.api.postProcessThirdDetail(params).subscribe((res) => {
      this.onThirdDetailDate = res.pojo;
      this.activeImg = this.onThirdDetailDate?.idScanImageFace;
      this.loading(false);
    });
  }

  onNav(i: number) {
    this.activeTabIndex = i;
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  async onDetail(detailTpl: TemplateRef<any>, item: any) {
    this.activeTabIndex = item.kycType;
    this.kycTypeTpl = item.kycType;
    this.onExamineDate = item;
    if (item.kycType === 3) {
      this.onItemThirdDetail(item.id);
      this.modal.open(detailTpl, {
        centered: true,
        windowClass: 'kyc-option-detail-modal',
        size: 'lg',
      });
    } else {
      this.onItemDetailDate(item.id);
      this.modal.open(detailTpl, {
        centered: true,
        windowClass: 'kyc-option-detail-modal',
        size: 'lg',
      });
    }
  }

  onReset() {
    this.searchData = cloneDeep(this.EMPTY_DATA);
    this.loadData(true);
  }

  onChangeImg(imgUrl: any) {
    this.activeImg = imgUrl;
  }

  /**
   * 导出
   * @param exList
   */
  async onExport(exList?: KYCProcessItem[]) {
    const list = exList || this.list;
    const merchant = await this.lang.getOne('common.merchant');
    const authContent = await this.lang.getOne('member.kyc.model.authenticationContent');
    const kycType = {
      0: await this.lang.getOne('member.kyc.basis'),
      1: await this.lang.getOne('member.kyc.middle'),
      2: await this.lang.getOne('member.kyc.adv'),
      3: await this.lang.getOne('member.kyc.vivoAuthentication'),
    };
    const status = await this.lang.getOne('member.kyc.model.approvalStatus');
    const statusLang = {
      0: await this.lang.getOne('member.kyc.underReview'),
      1: await this.lang.getOne('member.kyc.authenticationFailed'),
      2: await this.lang.getOne('member.kyc.authenticationSucceeded'),
    };
    const updateTime = await this.lang.getOne('member.kyc.model.updateTime');
    const merchantName = this.subHeaderService.getMerchantName(this.subHeaderService.merchantCurrentId);

    const curCheckedArr = list.map((e) => ({
      [merchant]: merchantName,
      UID: ExcelFormat.str(e.uid),
      [authContent]: kycType[e.kycType] || '',
      [status]: statusLang[e.processState] || '',
      [updateTime]: timeFormat(e.updateTimestamp),
    }));

    JSONToExcelDownload(curCheckedArr, 'kyc-review-list ' + Date.now());
  }

  /**
   * 导出全部 按当前筛选时间
   */
  onExportAll() {
    const [startTime, endTime] = this.searchData.updateTime;
    if (!startTime || !endTime || endTime - startTime > 90 * 864e5) {
      return this.appService.showToastSubject.next({ msgLang: 'member.kyc.selUpdateTimeTips' });
    }

    this.loadData$({ page: 1, size: 9e6 }).subscribe((res) => {
      if (!(Array.isArray(res.pageData) && res.pageData.length))
        return this.appService.showToastSubject.next({ msgLang: '' });

      this.onExport(res.pageData);
    });
  }
}
