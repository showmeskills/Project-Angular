import { Component, OnInit, Input } from '@angular/core';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { AppService } from 'src/app/app.service';
import { MemberApi } from 'src/app/shared/api/member.api';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, AsyncPipe } from '@angular/common';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';

@Component({
  selector: 'total-deposit',
  templateUrl: './total-deposit.component.html',
  styleUrls: ['./total-deposit.component.scss'],
  host: {
    class: 'custom-scroll-y',
  },
  standalone: true,
  imports: [
    ModalTitleComponent,
    NgFor,
    CurrencyIconDirective,
    NgIf,
    AngularSvgIconModule,
    NgSwitch,
    NgSwitchCase,
    LabelComponent,
    NgSwitchDefault,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    PaginatorComponent,
    AsyncPipe,
    TimeFormatPipe,
    CurrencyValuePipe,
    LangPipe,
  ],
})
export class TotalDepositComponent implements OnInit {
  constructor(
    public modal: MatModalRef<TotalDepositComponent>,
    public appService: AppService,
    private api: MemberApi
  ) {}

  @Input() type: any;
  @Input() uid: any;

  pageSizes: number[] = PageSizes; // 调整每页个数的数组
  paginator: PaginatorState = new PaginatorState(); // 分页
  isLoading = false;

  activeType = 1;
  typeList = [
    { name: this.isDeposit ? '存款成功' : '提款成功', value: 1 },
    { name: '全部', value: 0 },
  ];

  typeObj: any = {
    deposit: [
      { name: '存款成功', value: 1 },
      { name: '全部', value: 0 },
    ],
    withdraw: [
      { name: '提款成功', value: 1 },
      { name: '全部', value: 0 },
    ],
  };

  totalList: any[] = [];
  list: any[] = []; // 列表数据

  get isDeposit() {
    return this.type === 'totalDeposit' ? true : false;
  }

  ngOnInit(): void {
    this.api.getMemberdepositTotal({ uid: this.uid }).subscribe((res) => {
      if (res) this.totalList = this.isDeposit ? res?.deposit : res?.withdraw;
    });

    this.loadData(true);
  }

  /** getters */
  get curType() {
    return this.typeList[this.activeType].value;
  }

  /** methods */
  onTypeChange(value: number) {
    this.activeType = value;
    this.loadData(true);
  }

  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);

    this.loading(true);
    const params = {
      Uid: this.uid,
      Page: this.paginator.page,
      PageSize: this.paginator.pageSize,
      statusList: this.activeType ? ['Success'] : [],
      Category: this.isDeposit ? 'Deposit' : 'Withdraw',
    };
    this.api.getMemberDepositList(params).subscribe((res) => {
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
