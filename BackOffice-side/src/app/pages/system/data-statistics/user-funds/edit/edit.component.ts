import { Component, OnInit } from '@angular/core';
// import moment from 'moment';
import { AppService } from 'src/app/app.service';
import { StatApi } from 'src/app/shared/api/stat.api';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgFor, NgIf } from '@angular/common';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  standalone: true,
  imports: [ModalTitleComponent, NgFor, NgIf, AngularSvgIconModule, PaginatorComponent, CurrencyValuePipe, LangPipe],
})
export class StatisticsUserFundsEditComponent implements OnInit {
  constructor(
    public modal: MatModalRef<StatisticsUserFundsEditComponent>,
    private appService: AppService,
    private api: StatApi
  ) {}

  paginator: PaginatorState = new PaginatorState(); // 分页
  isLoading = false;

  parmas: any;
  list: any[] = [];

  ngOnInit() {
    this.paginator.pageSize = 10;
    // this.parmas.StatDate = moment(Number(this.parmas?.StatDate)).format('YYYY-MM-DD');
    this.loadData(true);
  }

  /** 冻结金额详情 - 数据获取 */
  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);
    this.loading(true);
    const parmas = {
      ...this.parmas,
      Page: this.paginator.page,
      PageSize: this.paginator.pageSize,
    };
    this.api.getMemberTimeShareFounds(parmas).subscribe((res) => {
      this.loading(false);
      if (res) {
        this.list = res?.list || [];
        this.paginator.total = res?.total || 0;
      }
    });
  }

  /** 加载状态 */
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }
}
