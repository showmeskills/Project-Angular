import { Component, OnInit } from '@angular/core';
import { VipApi } from 'src/app/shared/api/vip.api';
import { AppService } from 'src/app/app.service';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgIf } from '@angular/common';
import { MemberListTableComponent } from 'src/app/pages/member/list/list-table/list-table.component';

@Component({
  selector: 'invite-vip',
  templateUrl: './invite-vip.component.html',
  styleUrls: ['./invite-vip.component.scss'],
  standalone: true,
  imports: [AngularSvgIconModule, LangPipe, NgIf, MemberListTableComponent],
})
export class InviteVipComponent implements OnInit {
  constructor(
    public modal: MatModalRef<any>,
    public appService: AppService,
    public api: VipApi,
    public subHeader: SubHeaderService
  ) {}

  list: any[] = [];

  /**
   * 是否邀请SVIP
   *  true：是、false：否（移除）
   */
  isInvite = false;

  get checkedList() {
    return this.list.filter((e) => e.checked);
  }

  /** lifeCycle */
  ngOnInit(): void {}

  /** methods */
  onCancel() {
    this.list.forEach((e) => (e.checked = false));
  }

  onSubmit() {
    if (!this.checkedList) return;

    // 移除SVIP
    if (!this.isInvite) return this.removeSubmit();

    this.appService.isContentLoadingSubject.next(true);
    this.api[!this.subHeader.isFiveMerchant ? 'inviteSuperVip' : 'vip_svip_batchinvitetosvip'](
      [...this.checkedList.map((e) => ({ uid: e.uid }))],
      this.subHeader.merchantCurrentId
    ).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      if (res?.code !== '0000') return this.appService.showToastSubject.next({ msg: res?.message });
      this.appService.showToastSubject.next({ msgLang: 'common.sucOperation', successed: true });
      this.modal.close(true);
    });
  }

  /**
   * 移除SVIP提交
   * @private
   */
  private removeSubmit() {
    this.appService.isContentLoadingSubject.next(true);

    this.api[this.subHeader.isFiveMerchant ? 'cancelSVIPC' : 'cancelSVIP'](
      this.subHeader.merchantCurrentId,
      this.checkedList.map((e) => e.uid)
    ).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      if (res?.code !== '0000') return this.appService.showToastSubject.next({ msg: res?.message });
      this.appService.toastOpera(true);
      this.modal.close(true);
    });
  }
}
