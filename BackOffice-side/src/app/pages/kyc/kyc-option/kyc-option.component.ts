import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { finalize, Subject } from 'rxjs';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { KycApi } from 'src/app/shared/api/kyc.api';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgFor, NgSwitch, NgSwitchCase, NgIf } from '@angular/common';
import { KYCRegionEnum } from 'src/app/shared/interfaces/kyc';

@Component({
  templateUrl: './kyc-option.component.html',
  styleUrls: ['./kyc-option.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    NgSwitch,
    NgSwitchCase,
    NgIf,
    AngularSvgIconModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    PaginatorComponent,
    CurrencyValuePipe,
    LangPipe,
  ],
})
export class KycOptionComponent implements OnInit, OnDestroy {
  constructor(
    public router: Router,
    public modal: NgbModal,
    public subHeaderService: SubHeaderService,
    private appService: AppService,
    private api: KycApi,
    private activatedRoute: ActivatedRoute
  ) {
    const { tenantId } = this.activatedRoute.snapshot.queryParams;
    const { region } = this.activatedRoute.snapshot.queryParams; // 亚欧类型

    this.tenantId = tenantId;
    this.region = region || 'Asia'; // 默认亚洲
  }

  _destroyed: any = new Subject<void>();
  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页

  tenantId;
  /** 亚欧类型 */
  region: KYCRegionEnum;

  list: any[] = [];
  isLoading = false;
  detailData: any = {};

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading(true);
    // this.paginator.pageSize = 10;
    this.api
      .getKycSettinglist(String(this.tenantId))
      .pipe(finalize(() => this.loading(false)))
      .subscribe((data) => {
        this.list = data.list;
        this.paginator.total = data.total;
      });
  }

  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  async onDetail(detailTpl: TemplateRef<any>, item: any) {
    const param = {
      tenantId: item.tenantId,
      catagory: item.kycType,
    };
    this.api.getkycsettingdetail(param).subscribe((res) => {
      this.loading(false);
      if (!res) return;
      this.detailData = res;
      this.modal.open(detailTpl, {
        centered: true,
        windowClass: 'kyc-option-detail-modal',
      });
    });
  }

  onEdit(item: any) {
    this.router.navigate(['/kyc/count/option/edit'], {
      queryParams: { tenantId: item.tenantId, catagory: item.kycType, region: this.region },
    });
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }
}
