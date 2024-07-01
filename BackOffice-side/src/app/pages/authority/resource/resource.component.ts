import { Component, OnDestroy, OnInit } from '@angular/core';
import { PaginatorState, PageSizes } from 'src/app/_metronic/shared/crud-table';
import { Router } from '@angular/router';
import { ResourceApi } from 'src/app/shared/api/resource.api';
import { AppService } from 'src/app/app.service';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { JSONToExcelDownload } from 'src/app/shared/models/tools.model';
import { RolePermissionList } from 'src/app/shared/interfaces/role';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgFor, NgIf } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormsModule } from '@angular/forms';
import { LangModule } from 'src/app/shared/components/lang/lang.module';
import { LangService } from 'src/app/shared/components/lang/lang.service';

@Component({
  selector: 'app-resource',
  templateUrl: './resource.component.html',
  styleUrls: ['./resource.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    AngularSvgIconModule,
    NgFor,
    NgIf,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    PaginatorComponent,
    LangPipe,
    LangModule,
  ],
})
export class ResourceComponent implements OnInit, OnDestroy {
  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页

  list: any[] = []; // 表格列表数据
  order = ''; // 列表排序
  showList = false; // 是否显示列表
  code = ''; // 资源代码
  name = ''; // 资源名称
  isSearch = false; // 是否处于搜索
  isLoading = false; // 是否处于加载
  isCheckedAll = false; // 是否选择全部
  //searchEvent = new Subject<string>();   // 搜索触发流
  getListSubscription!: Subscription;
  item: any;
  modal!: NgbModalRef;

  constructor(
    public modalService: NgbModal,
    private router: Router,
    private api: ResourceApi,
    private appService: AppService,
    private lang: LangService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.getListSubscription.unsubscribe();
  }

  // 排序
  onSort(): void {
    const temp = ['', '1', '0'];
    const next = (temp.indexOf(this.order) + 1) % temp.length;

    this.order = temp[next];
    this.paginator.page = 1;
    this.loadData();
  }

  // 获取数据
  loadData() {
    if (this.isLoading) return;

    this.loading(true);
    this.getListSubscription = this.api
      .getresource({
        ...this.paginator,
        order: this.order,
        code: this.code,
        name: this.name,
      })
      .pipe(finalize(() => this.loading(false)))
      .subscribe((res) => {
        this.list = res.list;
        this.paginator.total = res.total;
      });
  }

  // 搜索
  onSearch(): void {
    this.loadData();
  }

  // 重置
  reset(): void {
    this.order = '';
    this.name = '';
    this.code = '';
    this.paginator.page = 1;
    this.loadData();
  }

  // 导出
  async onExport() {
    const resourceCode = await this.lang.getOne('authority.resourceCode');
    const resourceName = await this.lang.getOne('authority.resourceName');
    const resourceType = await this.lang.getOne('authority.resourceType');

    const curCheckedArr = this.list
      .filter((e) => e.checked)
      .map((e) => ({
        [resourceCode]: e.code,
        [resourceName]: e.name,
        [resourceType]: e.type,
      }));

    if (!curCheckedArr.length) {
      return this.appService.showToastSubject.next({
        msgLang: 'common.tickExport',
        successed: false,
      });
    }

    JSONToExcelDownload(curCheckedArr, 'resource-list ' + Date.now());
  }

  // 获取所选权限名
  getPermissionName(pr: RolePermissionList[]): string[] {
    const tmp: string[] = [];

    if (pr && pr.length) {
      pr.forEach((p) => {
        p.subTitles.forEach((e) => {
          e.permissions.forEach((j) => {
            if (j.access) {
              tmp.push(j.name);
            }
          });
        });
      });
    }

    return tmp;
  }

  // 选择所有
  onCheckAll(): void {
    this.list.forEach((e) => {
      e.checked = this.isCheckedAll;
    });
  }

  // 选择条目
  onItemCheck(): void {
    this.isCheckedAll = this.list.every((e) => e.checked);
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }
}
