import { Component, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { SelectChildrenDirective, SelectGroupDirective } from 'src/app/shared/directive/select.directive';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';

@Component({
  selector: 'app-competition-details',
  templateUrl: './competition-details.component.html',
  styleUrls: ['./competition-details.component.scss'],
  standalone: true,
  imports: [
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    SelectChildrenDirective,
    SelectGroupDirective,
    NgFor,
    FormsModule,
    NgIf,
    AngularSvgIconModule,
    PaginatorComponent,
    LangPipe,
  ],
})
export class CompetitionDetailsComponent implements OnInit {
  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页

  _destroyed: any = new Subject<void>(); // 订阅商户的流

  constructor(
    private appService: AppService,
    public subHeaderService: SubHeaderService
  ) {}

  isLoading = false;
  // 页面数据
  list: any = [];
  ngOnInit(): void {
    this.subHeaderService.merchantId$.pipe(takeUntil(this._destroyed)).subscribe(() => {
      this.loadData(true);
    });
  }

  // 获取页面渲染数据
  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);
    // 没有商户
    if (!this.subHeaderService.merchantCurrentId) return this.loading(false);

    this.list = [{}, {}, {}, {}, {}, {}, {}];
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }
}
