import { Component, OnInit } from '@angular/core';
import { PaginatorState, PageSizes } from 'src/app/_metronic/shared/crud-table';
import { NavigationEnd, Router } from '@angular/router';
import { AuthorityGroupApi } from 'src/app/shared/api/authority-group.api';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { NgFor, NgIf } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormsModule } from '@angular/forms';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss'],
  standalone: true,
  imports: [
    FormRowComponent,
    FormsModule,
    AngularSvgIconModule,
    NgFor,
    LabelComponent,
    NgIf,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    PaginatorComponent,
    LangPipe,
  ],
})
export class GroupComponent implements OnInit {
  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页

  isLoading = false;

  private _destroyed = new Subject<void>(); // 路由跳转的流

  constructor(
    private router: Router,
    private api: AuthorityGroupApi,
    private appService: AppService,
    private lang: LangService
  ) {
    /**
     * 页面被释放缓存后，ngOnInit不会被执行
     * 1. 在路由器事件中完成列表数据的更新。
     * 2. 必须是匹配‘编辑’路由返回才进行列表的初始化，避免在未缓存时切换路由造成二次请求。
     */
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntil(this._destroyed)
      )
      .subscribe(() => {
        if (this.router.routeReuseStrategy['curr'] === 'group/:id') this.loadData();
      });
  }

  searchKW = ''; // 搜索群名关键字
  list: any[] = []; // 表格列表数据
  groupUserList: any[] = []; // 群组成员数据

  ngOnInit(): void {
    this.reset();
  }

  // 获取数据
  loadData(resetPage = false): void {
    resetPage && (this.paginator.page = 1);
    this.loading(true);
    const params = {
      GroupName: this.searchKW,
      Page: this.paginator.page,
      PageSize: this.paginator.pageSize,
    };
    this.api.getList(params).subscribe((res) => {
      this.loading(false);
      this.paginator.total = res.total || 0;
      this.list = res.list || 0;
    });
  }

  onEdit(item): void {
    this.router.navigate(['/authority/group/' + item.id]);
  }

  // 重置
  reset(): void {
    this.searchKW = '';
    this.loadData(true);
  }

  // 删除群组用户
  delGroupUser(id: any, i: any) {
    this.api.deleteUserGroup([id]).subscribe((res) => {
      this.loading(false);
      if (res === true) this.groupUserList.splice(i, 1);
      this.appService.showToastSubject.next({
        msgLang: res === true ? 'auManage.role.delSuc' : 'auManage.role.delFail',
        successed: res === true ? true : false,
      });
    });
  }

  // 打开群组折叠
  onOpenExpand(item: any) {
    this.list.forEach((e) => (e.expand = false));
    this.groupUserList = [];

    this.loading(true);
    this.api.getbygroup(item.id).subscribe((res) => {
      this.loading(false);
      if (res instanceof Object) {
        this.groupUserList = res.users || [];
        item.expand = !item.expand;
      } else {
        this.appService.showToastSubject.next({
          msgLang: 'auManage.role.getFail',
          successed: false,
        });
      }
    });
  }

  // 新增
  add(): void {
    this.router.navigate(['/authority/group/add']);
  }

  // loading处理
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }
}
