import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MemberApi } from 'src/app/shared/api/member.api';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';

@Component({
  selector: 'comments-box',
  templateUrl: './comments-box.component.html',
  styleUrls: ['./comments-box.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ModalTitleComponent,
    AngularSvgIconModule,
    CurrencyIconDirective,
    EmptyComponent,
    PaginatorComponent,
    TimeFormatPipe,
    LangPipe,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    LoadingDirective,
  ],
})
export class CommentsBoxComponent implements OnInit {
  constructor(
    public modal: MatModalRef<CommentsBoxComponent>,
    private api: MemberApi
  ) {}

  @Input() uid: string;
  @Input() tenantId: string;

  pageSizes: number[] = PageSizes;
  paginator: PaginatorState = new PaginatorState();

  isLoading = false;

  list: any[] = []; // 列表数据

  ngOnInit() {
    this.loadData(true);
  }

  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);

    const params = {
      tenantId: this.tenantId,
      uid: this.uid,
      pageIndex: 1,
      pageSize: 999,
    };

    this.isLoading = true;
    this.api.getrccomment(params).subscribe((res) => {
      this.isLoading = false;

      this.list = Array.isArray(res) ? res : [];
      // this.paginator.total = res?.length || 0;
    });
  }
}
