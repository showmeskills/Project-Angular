import { Component, OnInit, Input } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { AppService } from 'src/app/app.service';
import { MemberApi } from 'src/app/shared/api/member.api';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import {
  ModalFooterComponent,
  ConfirmCloseDirective,
} from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';

@Component({
  selector: 'credit',
  templateUrl: './credit.component.html',
  styleUrls: ['./credit.component.scss'],
  standalone: true,
  imports: [
    ModalTitleComponent,
    NgFor,
    CurrencyIconDirective,
    NgIf,
    AngularSvgIconModule,
    PaginatorComponent,
    ModalFooterComponent,
    ConfirmCloseDirective,
    AsyncPipe,
    TimeFormatPipe,
    CurrencyValuePipe,
    LangPipe,
  ],
})
export class CreditComponent implements OnInit {
  constructor(
    public appService: AppService,
    private api: MemberApi,
    public modal: MatModalRef<CreditComponent>
  ) {}

  pageSizes: number[] = PageSizes; // 调整每页个数的数组
  paginator: PaginatorState = new PaginatorState(); // 分页
  isLoading = false;

  list: any[] = []; // 列表数据

  @Input() uid: any;

  ngOnInit(): void {
    this.paginator.pageSize = 6;
    this.loadData(true);
  }

  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);

    this.loading(true);
    const params = {
      Uid: this.uid,
      Page: this.paginator.page,
      PageSize: this.paginator.pageSize,
    };
    this.api.getCouponList(params).subscribe((res) => {
      this.loading(false);
      if (res) {
        this.list = res?.list || [];
        this.paginator.total = res?.total || 0;
      }
    });
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }
}
