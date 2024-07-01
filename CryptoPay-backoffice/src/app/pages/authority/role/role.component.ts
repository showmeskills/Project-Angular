import { Component, OnDestroy, TemplateRef, OnInit, ViewChild } from '@angular/core';
import { PaginatorState, PageSizes } from 'src/app/_metronic/shared/crud-table';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AuthorityRoleApi } from 'src/app/shared/api/authority-role.api';
import { AppService } from 'src/app/app.service';
import { filter, finalize, map, pluck, tap, takeUntil } from 'rxjs/operators';
import { distinctUntilChanged, Subject, Subscription } from 'rxjs';
import { JSONToExcelDownload } from 'src/app/shared/models/tools.model';
import { PermissionApi } from 'src/app/shared/api/permission.api';
import { RolePermissionList } from 'src/app/shared/interfaces/role';
import { DrawerService } from 'src/app/shared/components/dialogs/modal';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { AuthItemComponent } from './auth-item/auth-item.component';
import { NgFor, NgIf } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormsModule } from '@angular/forms';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss'],
  standalone: true,
  imports: [
    FormRowComponent,
    FormsModule,
    AngularSvgIconModule,
    NgFor,
    NgIf,
    AuthItemComponent,
    MatSelectModule,
    MatOptionModule,
    PaginatorComponent,
    MatFormFieldModule,
    TimeFormatPipe,
    LangPipe,
  ],
})
export class RoleComponent implements OnInit, OnDestroy {
  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  list: any[] = []; // 表格列表数据
  sort = ''; // 列表排序
  showList = false; // 是否显示列表
  searchKW = ''; // 搜索群名关键字
  isSearch = false; // 是否处于搜索
  isLoading = false; // 是否处于加载
  isCheckedAll = false; // 是否选择全部
  searchEvent = new Subject<string>(); // 搜索触发流
  searchSubscription!: Subscription;
  groupId = '';

  paginatorPopup: PaginatorState = new PaginatorState(); // 弹窗分页
  userPopupList: any[] = []; // 弹窗列表数据
  userPopupId = 0; // 弹窗列表数据请求id
  isLogList = false; // 是否为日志列表

  private _destroyed = new Subject<void>(); // 路由跳转的流

  constructor(
    private router: Router,
    private api: AuthorityRoleApi,
    private permissionApi: PermissionApi,
    private appService: AppService,
    private drawer: DrawerService,
    private activatedRoute: ActivatedRoute,
    private lang: LangService
  ) {
    const { id } = activatedRoute.snapshot.params;
    if (id) {
      localStorage.setItem('isGroupRole', '1');
    } else {
      localStorage.setItem('isGroupRole', '0');
    }
    this.groupId = id;

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
        if (this.router.routeReuseStrategy['curr'] === 'role/edit/:id') this.loadData();
      });
  }

  ngOnInit(): void {
    // 搜索流订阅
    this.searchSubscription = this.searchEvent
      .pipe(
        tap((kw) => (this.searchKW = kw)), // 自定义的内容 如重置进行更新
        distinctUntilChanged() // 保证kw不被连续检索
      )
      .subscribe(() => {
        this.reset();
      });

    this.searchEvent.next(this.searchKW); // 初始化请求一次 让distinctUntilChanged能够缓存进行比对判断
  }

  ngOnDestroy(): void {
    this.searchSubscription.unsubscribe();
    this._destroyed.next();
    this._destroyed.complete();
  }

  // 排序
  onSort(): void {
    const temp = ['', 'DESC', 'ASC'];
    const next = (temp.indexOf(this.sort) + 1) % temp.length;
    this.sort = temp[next];
    this.paginator.page = 1;
    this.loadData();
  }

  // 获取数据
  loadData() {
    this.loading(true);
    const params = this.groupId
      ? {
          ...this.paginator,
          roleName: this.searchKW,
          stateOrder: this.sort,
          groupId: this.groupId,
        }
      : { ...this.paginator, roleName: this.searchKW, stateOrder: this.sort };
    this.api
      .getList(params)
      .pipe(
        map((res) => ({ ...res, list: this.addSelected(res.list) })),
        finalize(() => this.loading(false))
      )
      .subscribe((res) => {
        this.list = res.list;
        this.paginator.total = res.total;
      });
  }

  // 添加选择属性
  addSelected(arr: Array<any>): any[] {
    this.isCheckedAll = false;

    return arr.map((e) => {
      e.checked = false;
      return e;
    });
  }

  // 搜索流
  onSearch(kw: string): void {
    this.searchEvent.next(kw);
  }

  // 重置
  reset(): void {
    this.sort = '';
    this.isSearch = !!this.searchKW;
    this.paginator.page = 1;
    this.loadData();
  }

  // 导出
  async onExport() {
    let open = await this.lang.getOne('common.open');
    let close = await this.lang.getOne('common.off');
    let name = await this.lang.getOne('auManage.role.name');
    let group = await this.lang.getOne('auManage.role.beGroup');
    let openStu = await this.lang.getOne('auManage.role.openStu');
    let qx = await this.lang.getOne('auManage.role.qx');
    const curCheckedArr = this.list
      .filter((e) => e.checked)
      .map((e) => ({
        [name]: e.name,
        [group]: e.groupName,
        [openStu]: e.state ? open : close,
        [qx]: this.getPermissionName(e.permission).join(' '),
      }));

    if (!curCheckedArr.length) {
      return this.appService.showToastSubject.next({
        msgLang: 'common.tickExport',
        successed: false,
      });
    }

    JSONToExcelDownload(curCheckedArr, 'role-list ' + Date.now());
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

  // 查看权限
  onMore(item): void {
    if (!item.isMore && !item.permission) {
      this.loading(true);
      this.permissionApi
        .getRole(item.id)
        .pipe(
          finalize(() => this.loading(false)),
          pluck('titles', '0', 'subTitles'),
          map<RolePermissionList[], RolePermissionList[]>(this.mapPermission)
        )
        .subscribe((res) => {
          item.permission = res || [];
          item.isMore = true;
        });
    } else {
      item.isMore = !item.isMore;
    }
  }

  // 过滤未勾选权限
  mapPermission(item: RolePermissionList[]): RolePermissionList[] {
    return item.filter((e) => {
      e.subTitles = e.subTitles.filter((j) => {
        j.permissions = j.permissions.filter((k) => k.access);
        return j.permissions.length;
      });

      return e.subTitles.length;
    });
  }

  // 新增
  add(): void {
    this.router.navigate(['/authority/role/edit']);
  }

  // 编辑
  onEdit(item): void {
    this.router.navigate(['/authority/role/edit', item.id]);
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  onState(item): void {
    this.loading(true);
    this.api
      .updateRole({
        id: item.id,
        name: item.name,
        groupId: item.groupId,
        state: item.state,
      })
      .pipe(finalize(() => this.loading(false)))
      .subscribe((res) => {
        if (res === true) {
          this.appService.showToastSubject.next({
            msgLang: 'game.change_suc',
            successed: true,
          });
        } else {
          item.state = !item.state; // 还原修改的状态
          this.appService.showToastSubject.next({
            msgLang: 'game.change_fail',
            successed: false,
          });
        }
      });
  }

  // 会员活动 查看全部 弹窗
  @ViewChild('userPopup') userPopup: TemplateRef<any>;
  closeUserDialog: any;
  openPopup(id: any, isPopupType: boolean) {
    this.loading(true);
    if (!id) {
      this.appService.showToastSubject.next({
        msgLang: 'auManage.role.loadFail',
        successed: false,
      });
      this.loading(false);
      return;
    }
    this.userPopupId = id;
    this.isLogList = isPopupType;
    this.getPopupList();
    this.closeUserDialog = this.drawer.open(this.userPopup, {
      width: '660px',
    });
  }

  closeUserPopup() {
    this.closeUserDialog.close();
  }

  getPopupList() {
    this.paginatorPopup.page = 1;
    this.paginatorPopup.pageSize = 30;
    const params = {
      RoleId: this.userPopupId,
      pageIndex: this.paginatorPopup.page,
      pageSize: this.paginatorPopup.pageSize,
    };
    this.api[this.isLogList ? 'getPageRoleLog' : 'getPageUserRole'](params).subscribe((res) => {
      this.loading(false);
      this.userPopupList = res?.list || [];
      this.paginatorPopup.total = res?.total || 0;
    });
  }
}
