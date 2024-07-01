import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { Prize, PrizeAmountType, PrizeType, PrizeTypeItem } from 'src/app/shared/interfaces/activity';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivityAPI } from 'src/app/shared/api/activity.api';
import { AppService } from 'src/app/app.service';
import { ActivatedRoute } from '@angular/router';
import { of, switchMap, zip } from 'rxjs';
import { cloneDeep } from 'lodash';
import { ActivityResponse } from 'src/app/shared/interfaces/base.interface';
import { tap } from 'rxjs/operators';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { PrizeConfigPipe } from '../../../bonus.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import {
  ModalFooterComponent,
  DismissCloseDirective,
} from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { PrizeService } from 'src/app/pages/Bonus/prize.service';

@Component({
  selector: 'prize-select',
  templateUrl: './prize-select.component.html',
  styleUrls: ['./prize-select.component.scss'],
  standalone: true,
  imports: [
    ModalTitleComponent,
    FormsModule,
    ReactiveFormsModule,
    NgFor,
    FormRowComponent,
    NgIf,
    EmptyComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    PaginatorComponent,
    ModalFooterComponent,
    DismissCloseDirective,
    TimeFormatPipe,
    FormatMoneyPipe,
    LangPipe,
    PrizeConfigPipe,
    AsyncPipe,
  ],
})
export class PrizeSelectComponent implements OnInit {
  constructor(
    public lang: LangService,
    public modal: MatModalRef<any, Prize>,
    private fb: FormBuilder,
    private api: ActivityAPI,
    public appService: AppService,
    private route: ActivatedRoute,
    public prizeService: PrizeService
  ) {
    const { id } = this.route.snapshot.params;
    const { tenantId } = this.route.snapshot.queryParams;

    this.id = +id || 0;
    this.tenantId = tenantId || '';
  }

  id;
  tenantId;
  list: Prize[] = [];
  selectPrize: Prize | null = null;
  typeList: PrizeTypeItem[] = [];
  PrizeType = PrizeType;
  amountType = [
    { label: '固定金额', value: PrizeAmountType.Fixed, lang: 'common.amount' },
    { label: '按比例', value: PrizeAmountType.Rate, lang: 'common.proportion' },
  ];

  formGroup = this.fb.group({
    type: [null as null | number, Validators.required],
    prizeName: [''],
    prizeCode: [''],
    amountType: [1],
  });

  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页

  @ViewChild('scrollDOM', { static: true }) scrollDOM: ElementRef<HTMLDivElement>;

  ngOnInit() {
    this.appService.isContentLoadingSubject.next(true);
    zip(
      this.api.prize_getprizetypes(this.tenantId).pipe(
        switchMap((typeList) => {
          this.typeList = typeList?.data?.filter((e) => e.prizeTypeValue) || [];
          this.formGroup.patchValue({ type: this.formGroup.value.type || this.typeList[0]?.prizeTypeValue || null });

          if (
            !this.formGroup.value.type ||
            !this.typeList.some((e) => this.formGroup.value.type === e.prizeTypeValue)
          ) {
            this.appService.showToastSubject.next({ msgLang: 'luckRoulette.notMatchPrizeType' });
            this.formGroup.patchValue({
              type: this.typeList[0]?.prizeTypeValue || null,
              prizeName: '',
              amountType: 1,
              prizeCode: '',
            });
          }

          return this.loadData$();
        })
      )
    ).subscribe(() => {
      this.appService.isContentLoadingSubject.next(false);
    });
  }

  onSubmit() {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid) return;
    if (!this.selectPrize) {
      return this.appService.showToastSubject.next({ msgLang: 'form.arrayRequired' });
    }

    this.modal.close(
      cloneDeep({
        ...this.selectPrize,
        prizeTypeName: this.typeList.find((e) => e.prizeTypeValue === this.selectPrize?.prizeType)?.prizeTypeName,
      })
    );
  }

  /**
   * 奖品类型改变
   */
  onType(): void {
    this.formGroup.patchValue({ amountType: 1, prizeCode: '', prizeName: '' });
    this.loadData(true);
  }

  /**
   * 加载奖品数据
   */
  loadData(resetPage = false) {
    this.appService.isContentLoadingSubject.next(true);
    this.loadData$(resetPage).subscribe(() => this.appService.isContentLoadingSubject.next(false));
  }

  /**
   * 加载类型的流
   */
  loadData$(resetPage = false) {
    resetPage && (this.paginator.page = 1);

    if (!this.formGroup.value.type) {
      return of<ActivityResponse<{ prizes: Prize[]; totalCount: number }>>({
        data: { prizes: [], totalCount: 0 },
        success: true,
      });
    }

    return this.api
      .prize_getprizesbytype({
        merchantId: this.tenantId,
        prizeType: this.formGroup.value.type!,
        amountType: ![
          PrizeType.Cash,
          PrizeType.Credit,
          PrizeType.AfterCash,
          PrizeType.NonStickyBonus,
          PrizeType.StickyBonus,
        ].includes(this.formGroup.value.type)
          ? 0
          : this.formGroup.value.amountType!,
        lang: this.lang.currentLang.toLowerCase(),
        prizeCode: this.formGroup.value.prizeCode!,
        prizeName: this.formGroup.value.prizeName!,
        pageSize: this.paginator.pageSize!,
        pageIndex: this.paginator.page!,
      })
      .pipe(
        tap((res) => {
          this.list = res?.data?.prizes || [];
          this.paginator.total = res?.data?.totalCount || 0;
          setTimeout(() => {
            this.scrollDOM.nativeElement.scrollTop = 0;
          }, 100);
        })
      );
  }

  /**
   * 更新值
   */
  public updateValue(value: typeof this.formGroup.value) {
    this.formGroup.patchValue(value);
  }

  reset() {
    this.formGroup.reset({
      amountType: 1,
      prizeCode: '',
      prizeName: '',
      type: this.formGroup.value.type,
    });
    this.loadData(true);
  }

  /**
   * 选择奖品
   * @param item
   */
  onSelect(item: Prize) {
    this.selectPrize = cloneDeep(item);
  }
}
