import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { cloneDeep } from 'lodash';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { AppService } from 'src/app/app.service';
import { MemberApi } from 'src/app/shared/api/member.api';
import { VipApi } from 'src/app/shared/api/vip.api';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { SelectChildrenDirective, SelectGroupDirective } from 'src/app/shared/directive/select.directive';
import { VipNamePipe } from 'src/app/shared/pipes/common.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { MessageBanListAddPopupComponent } from './add-popup/add-popup.component';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { ConfirmModalService } from 'src/app/shared/components/dialogs/confirm-modal/confirm-modal.service';
import { MessageBanItem } from 'src/app/shared/interfaces/member.interface';
import { takeUntil } from 'rxjs';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { DestroyService } from 'src/app/shared/models/tools.model';

@Component({
  selector: 'message-ban-list',
  templateUrl: './message-ban-list.component.html',
  styleUrls: ['./message-ban-list.component.scss'],
  providers: [DestroyService],
  standalone: true,
  imports: [
    CommonModule,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    FormWrapComponent,
    MatOptionModule,
    PaginatorComponent,
    TimeFormatPipe,
    LangPipe,
    EmptyComponent,
    AngularSvgIconModule,
    SelectChildrenDirective,
    SelectGroupDirective,
    VipNamePipe,
  ],
})
export class MessageBanListComponent implements OnInit {
  constructor(
    public subHeaderService: SubHeaderService,
    public appService: AppService,
    public lang: LangService,
    public router: Router,
    private vipApi: VipApi,
    private api: MemberApi,
    private modalService: MatModal,
    private confirmModalService: ConfirmModalService,
    private destroy$: DestroyService
  ) {}

  /** 页大小 */
  pageSizes: number[] = PageSizes;

  /** 分页 */
  paginator: PaginatorState = new PaginatorState();

  /** VIP等级列表 */
  // vipLevelList: { name: string; value: number }[] = [];

  dataEmpty = {
    uid: '', // UID
    // vipLevel: '', // VIP等级
  };

  data = cloneDeep(this.dataEmpty);

  /** 列表数据 */
  list: MessageBanItem[] = [];

  ngOnInit() {
    // this.getVipLevelList();

    this.subHeaderService.merchantId$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.onReset();
    });
  }

  /** 获取VIP等级列表 */
  // getVipLevelList() {
  //   this.vipApi.vip_manage_level_simple_list(this.subHeaderService.merchantCurrentId).subscribe((res) => {
  //     if (res?.code === '0000' && Array.isArray(res?.data))
  //       this.vipLevelList = res.data.map((v) => ({ name: v?.vipName, value: v?.vipLevel }));
  //   });
  // }

  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);

    this.appService.isContentLoadingSubject.next(true);
    this.loadData$().subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      this.list = Array.isArray(res?.data?.list) ? res.data.list : [];
      this.paginator.total = res?.data?.total || 0;
    });
  }

  loadData$(sendData?) {
    const parmas = {
      tenantId: this.subHeaderService.merchantCurrentId,
      uids: this.data.uid,
      // vipLevel: this.data.vipLevel,
      current: this.paginator.page,
      size: this.paginator.pageSize,
      ...sendData,
    };
    return this.api.getMessageBanList(parmas);
  }

  onReset() {
    this.data = cloneDeep(this.dataEmpty);
    this.loadData(true);
  }

  /**
   * 删除
   * @isBatch 是否批量
   * */
  onDeletion(isBatch = false, uid?: string) {
    if (!uid && !this.list.length) return this.appService.showToastSubject.next({ msgLang: 'bonus.activity.noData' });

    const uids =
      this.list
        .filter((v) => v?.checked)
        .map((v) => v.uid)
        .join(';') || '';

    if (isBatch && !uids)
      return this.appService.showToastSubject.next({
        msgLang: 'bonus.activity.chooseDelContent',
      });

    this.confirmModalService
      .open({ msgLang: 'member.list.messageBan.isDeletionTips' })
      .result.then(() => {
        let parmas = {
          ...(isBatch ? { uids } : { uids: uid }),
          tenantId: this.subHeaderService.merchantCurrentId,
        };

        this.appService.isContentLoadingSubject.next(true);
        this.api.deleteMessageBanList(parmas).subscribe((res) => {
          this.appService.isContentLoadingSubject.next(false);

          if (res?.code !== '0')
            return this.appService.showToastSubject.next(
              res.message ? { msg: res.message } : { msgLang: 'common.operationFailed' }
            );

          this.appService.showToastSubject.next({ msgLang: 'common.sucOperation', successed: true });
          if (res.code === '0') setTimeout(() => this.loadData(), 100);
        });
      })
      .catch(() => {});
  }

  /** 新增禁用名单 - 弹窗操作 */
  onAddPopup() {
    const modalRef = this.modalService.open(MessageBanListAddPopupComponent, {
      width: '744px',
      disableClose: true,
    });
    modalRef.componentInstance['tenantId'] = this.subHeaderService.merchantCurrentId;

    modalRef.result
      .then((res) => {
        res && setTimeout(() => this.loadData(true), 100);
      })
      .catch(() => {});
  }
}
