import { Component, OnInit } from '@angular/core';
import { cloneDeep } from 'lodash';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { AppService } from 'src/app/app.service';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { Router } from '@angular/router';
import { IPApi } from 'src/app/shared/api/ip.api';
import { IPCategory, WhiteItem } from 'src/app/shared/interfaces/ip';
import { ConfirmModalService } from 'src/app/shared/components/dialogs/confirm-modal/confirm-modal.service';
import { SubHeaderPipe } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { StickyAutoDirective } from 'src/app/shared/directive/sticky-auto.directive';

@Component({
  selector: 'white-ip',
  templateUrl: './white-ip.component.html',
  styleUrls: ['./white-ip.component.scss'],
  standalone: true,
  imports: [
    StickyAutoDirective,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    NgFor,
    AngularSvgIconModule,
    NgIf,
    EmptyComponent,
    PaginatorComponent,
    AsyncPipe,
    TimeFormatPipe,
    LangPipe,
    SubHeaderPipe,
  ],
})
export class WhiteIpComponent implements OnInit {
  constructor(
    public modal: MatModal,
    public appService: AppService,
    public subHeaderService: SubHeaderService,
    public lang: LangService,
    private router: Router,
    private api: IPApi,
    private confirmModalService: ConfirmModalService
  ) {
    subHeaderService.loadMerchant(true);
  }

  EMP_DATA = {
    merchantId: '', // 商户
    category: '', // 订单号
    ip: '',
  };

  data = cloneDeep(this.EMP_DATA);
  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  list: WhiteItem[] = [];
  typeList = [
    { name: 'API白名单', lang: 'system.ip.apiWhite', value: IPCategory.Merchant },
    { name: '后台白名单', lang: 'system.ip.backendWhite', value: IPCategory.Admin },
  ];

  ngOnInit(): void {
    this.onReset();
  }

  /**
   * 加载数据
   * @param resetPage
   */
  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);
    this.appService.isContentLoadingSubject.next(true);
    this.api
      .getWhiteList({
        ...this.data,
        merchantId: this.data.merchantId || undefined,
        category: (this.data.category as any) || undefined,
        pageIndex: this.paginator.page,
        pageSize: this.paginator.pageSize,
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);
        this.list = Array.isArray(res?.list) ? res.list : [];
        this.paginator.total = res?.total || 0;
      });
  }

  /**
   * 重置
   */
  onReset() {
    this.data = cloneDeep(this.EMP_DATA);
    this.paginator.page = 1;

    this.loadData(true);
  }

  /**
   * 去新增IP
   */
  goAdd() {
    this.router.navigate(['/system/mw-ip/add']);
  }

  getCategoryName(category: IPCategory): string {
    return this.typeList.find((item) => item.value === category)?.lang || '';
  }

  /**
   * 删除
   * @param item
   */
  async onDel(item: WhiteItem) {
    if ((await this.confirmModalService.open('form.isDelete').result) !== true) return;

    this.appService.isContentLoadingSubject.next(true);
    this.api.deleteWhite(item.id).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      this.appService.toastOpera(res === true);
      res === true && this.loadData();
    });
  }
}
