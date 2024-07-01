import { Component, OnInit } from '@angular/core';
import { MatModal, MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { QuizActivityApi } from 'src/app/shared/api/quiz-activity.api';
import { AppService } from 'src/app/app.service';
import { BonusService } from 'src/app/pages/Bonus/bonus.service';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { cloneDeep } from 'lodash';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { InputNumberDirective } from 'src/app/shared/directive/input.directive';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';

@Component({
  selector: 'app-billing-popup',
  templateUrl: './billing-popup.component.html',
  styleUrls: ['./billing-popup.component.scss'],
  standalone: true,
  imports: [
    ModalTitleComponent,
    NgFor,
    FormsModule,
    FormWrapComponent,
    InputNumberDirective,
    ModalFooterComponent,
    AngularSvgIconModule,
    LangPipe,
    EmptyComponent,
    NgIf,
  ],
})
export class BillingPopupComponent implements OnInit {
  constructor(
    public modal: MatModalRef<BillingPopupComponent>,
    private modalService: MatModal,
    private api: QuizActivityApi,
    private appService: AppService,
    private bonusService: BonusService,
    public lang: LangService
  ) {}

  /** 审核&详情 内容 */
  data: any = {};

  defaultImg = './assets/images/svg/team.svg';
  isLoading = false;

  /** 图片域名 */
  hostUrl: any = '';

  ngOnInit(): void {
    this.hostUrl = this.appService.getStaticHost();
  }

  /**
   * 传递data数据
   * @param v
   */
  propData(v: any) {
    const res = cloneDeep(v);
    res.matches?.forEach((e) => (e.checked = true));

    this.data = res;
  }

  async onSubmit(noSelTpl) {
    if (!this.data.matches.some((e) => e.checked))
      return this.appService.showToastSubject.next({ msgLang: 'form.everyEventRequired' });

    const hasNoSel = !this.data['matches'].every((e) => e.checked);

    if (hasNoSel) {
      const modal = this.modalService.open(noSelTpl, { width: '500px' });
      if ((await modal.result) !== true) return;
    }

    this.submit();
  }

  submit() {
    const matches = this.data.matches
      .filter((e) => e.checked)
      .map((e) => {
        const res = { ...e };
        delete res.checked;
        return res;
      });
    this.appService.isContentLoadingSubject.next(true);
    this.api.activitySettle({ ...this.data, matches }).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      if (res.success) {
        this.appService.showToastSubject.next({
          msgLang: 'member.activity.sencli6.settledSuccessfully',
          successed: true,
        });
        this.bonusService.updateList.next();
      } else {
        this.appService.showToastSubject.next({
          msgLang: 'member.activity.sencli6.billingFailed',
        });
      }
    });
    this.modal.close(true);
  }

  /** 加载状态 */
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }
}
