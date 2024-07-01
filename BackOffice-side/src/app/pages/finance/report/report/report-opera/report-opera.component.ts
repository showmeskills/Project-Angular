import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { LangModule } from 'src/app/shared/components/lang/lang.module';
import { AppService } from 'src/app/app.service';
import { WagerApi } from 'src/app/shared/api/wager.api';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { CancelBetApplyComponent } from 'src/app/pages/finance/report/report/report-opera/cancel-bet-apply/cancel-bet-apply.component';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'report-opera',
  standalone: true,
  imports: [CommonModule, AngularSvgIconModule, LangModule],
  templateUrl: './report-opera.component.html',
  styleUrls: ['./report-opera.component.scss'],
})
export class ReportOperaComponent implements OnInit {
  constructor(
    private appService: AppService,
    private modalService: MatModal,
    private api: WagerApi,
    private lang: LangService
  ) {}

  @Input() titleLang = 'game.detail.operate';
  @Input() data: any = {};
  @Input() orderNumber: string;
  @Output() update = new EventEmitter<{ reload: boolean }>();

  ngOnInit(): void {}

  /** methods */

  /**
   * 注单重送查询
   */
  async wagerSendQuery() {
    if (!this.orderNumber) return this.appService.showToastSubject.next({ msgLang: 'form.notWagerId' });
    const re = await this.lang.getOne('game.detail.resend_check');
    this.appService.isContentLoadingSubject.next(true);
    this.api.resendSport(this.orderNumber).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      this.wagerProcessResponse(res, re);
    });
  }

  /**
   * 打开注单取消申请弹窗
   */
  async openCancelModal() {
    if (!this.orderNumber) return this.appService.showToastSubject.next({ msgLang: 'form.notWagerId' });
    const ref = this.modalService.open(CancelBetApplyComponent, { width: '878px', disableClose: true });
    ref.componentInstance.data = cloneDeep(this.data);

    (await ref.result) && this.update.emit({ reload: true });
  }

  async wagerProcessResponse(res: any, msg: string) {
    const suc = await this.lang.getOne('game.detail.suc');
    const fail = await this.lang.getOne('game.detail.fail');
    if (res === true) {
      this.update.emit({ reload: true });
      this.appService.showToastSubject.next({
        msg: msg + suc,
        successed: true,
      });
    } else {
      this.appService.showToastSubject.next({
        msg: msg + fail,
        successed: false,
      });
    }
  }
}
