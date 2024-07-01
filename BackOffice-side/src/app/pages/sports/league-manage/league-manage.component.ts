import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { MatchComponent } from './match/match.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { NgFor, NgIf } from '@angular/common';
import { CategoryMenuComponent } from '../category-menu/category-menu.component';
import { SubHeaderDirective } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.directive';

@Component({
  selector: 'app-league-manage',
  templateUrl: './league-manage.component.html',
  styleUrls: ['./league-manage.component.scss'],
  standalone: true,
  imports: [
    SubHeaderDirective,
    CategoryMenuComponent,
    NgFor,
    FormWrapComponent,
    AngularSvgIconModule,
    FormsModule,
    NgIf,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    PaginatorComponent,
    LangPipe,
  ],
})
export class LeagueManageComponent implements OnInit, OnDestroy {
  _destroyed$: any = new Subject<void>(); // 订阅商户的流
  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 国家分页
  leaguePaginator: PaginatorState = new PaginatorState(); // 联赛分页

  isLoading = false;
  constructor(
    private subHeaderService: SubHeaderService,
    private appService: AppService,
    private modalService: MatModal
  ) {}

  curStatusValue: any = 1;

  curSort: any = 1;
  sortList: any[] = [
    { name: '字母', value: 1 },
    { name: '数量', value: 2 },
  ];

  areaSearch: any = '';
  areaList: any[] = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4, 5, 6, 7, 8, 9,
  ];

  leagueSearch: any = '';
  leagueList: any[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 8, 9, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 8, 9];

  ngOnInit() {
    this.paginator.total = 100;
    this.leaguePaginator.total = 100;
    this.subHeaderService.merchantId$.pipe(takeUntil(this._destroyed$)).subscribe(() => {
      this.getAreaList();
    });
  }

  getAreaList() {}

  getLeagueList() {}

  seletedStatus(value: any) {
    this.curStatusValue = value;
  }

  sportsMenuChange(e: any) {
    console.log(e);
  }

  selectSort(value: any) {
    this.curSort = value;
  }

  onOpenMatchPopup() {
    const modalRef = this.modalService.open(MatchComponent, { width: '800px', disableClose: true });
    modalRef.result.then(() => {}).catch(() => {});
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  ngOnDestroy(): void {
    this._destroyed$.next();
    this._destroyed$.complete();
  }
}
