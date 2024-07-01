import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RiskControlApi } from 'src/app/shared/apis/risk-control.api';
import { RiskAuth, RiskForm, RiskFormType } from 'src/app/shared/interfaces/risk-control.interface';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { PopupService } from 'src/app/shared/service/popup.service';
import { RiskPopupComponent } from './risk-popup/risk-popup.component';

@Injectable({
  providedIn: 'root',
})
export class RiskControlService {
  constructor(
    private popup: PopupService,
    private localStorageService: LocalStorageService,
    private riskApi: RiskControlApi
  ) {}

  /**显示任务浮框 */
  showAuthTask$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  /**显示风控横幅 */
  showRiskBanner$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    (this.localStorageService.loginToken && this.localStorageService.riskBanner) ?? false
  );
  /** 任务列表*/
  riskTaskList: RiskAuth[] = [];
  /** 用户风控表单 */
  riskFormList: RiskForm[] = [];

  /**
   * 风控提示弹窗
   *
   * @param type
   */
  openPopup(type: RiskFormType) {
    this.popup.open(RiskPopupComponent, {
      speed: 'faster',
      autoFocus: false,
      disableClose: true,
      data: {
        type: type,
      },
    });
  }

  /**
   * 用户是否在风险列表中
   */
  checkIfRiskMember() {
    if (!this.localStorageService.loginToken) return;
    this.riskApi.getRiskStatus().subscribe(resp => {
      this.showRiskBanner$.next(resp.data ?? false);
      this.localStorageService.riskBanner = resp.data ?? false;
    });
  }

  /**
   * 查看用户需要填写的风控表单
   */
  checkUserRiskForm() {
    this.riskApi.getRiskFrom().subscribe(x => {
      const formValue = x.data.map(x => x.type)[0];
      this.handleFormStorage(true, formValue);
      if (x.data.length) {
        this.riskFormList = x.data;
        console.log('this.riskFormlist', this.riskFormList);
        this.openPopup(this.riskFormList[0]?.type);
      }
    });
  }

  /**
   * 处理表单本地缓存数组
   *
   * @param add
   * @param value
   */
  handleFormStorage(add: boolean, value: string | RiskFormType) {
    if (!value) return;

    if (this.localStorageService.riskForm) {
      const savedForm = JSON.parse(this.localStorageService.riskForm);
      if (savedForm.includes(value)) {
        if (add) return;
        //移除
        const index = savedForm.findIndex((x: any) => x === value);
        savedForm.splice(index, 1);
        this.localStorageService.riskForm = JSON.stringify(savedForm);
        return;
      }

      //添加
      savedForm.push(value);
      this.localStorageService.riskForm = JSON.stringify(savedForm);
      return;
    }

    if (add) {
      this.localStorageService.riskForm = JSON.stringify([value]);
      return;
    }
  }
}
