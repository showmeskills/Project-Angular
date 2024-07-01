import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { VipApi } from 'src/app/shared/api/vip.api';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
@Component({
  selector: 'vip-setting',
  templateUrl: './vip-setting.component.html',
  styleUrls: ['./vip-setting.component.scss'],
  standalone: true,
  imports: [AngularSvgIconModule, FormsModule, NgFor, FormWrapComponent, LangPipe],
})
export class VipSettingComponent implements OnInit {
  @Input() tenantId;
  @Input() levelConfigList: any[] = [];
  @Input() basicConfigList: any = {};

  constructor(
    public modal: NgbActiveModal,
    private vipApi: VipApi,
    private appService: AppService,
    public langService: LangService
  ) {}

  isLoading = false; // 是否处于加载

  ngOnInit(): void {}

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  onSubCommit() {
    this.loading(true);

    forkJoin([
      this.vipApi.getBasicConfigUpdate(this.basicConfigList, this.tenantId), // 基础配置 更新
      this.vipApi.getLevelConfigUpdate(this.levelConfigList, this.tenantId), // 等级配置 更新
    ]).subscribe(([basicRes, levelRes]) => {
      this.loading(false);

      if (basicRes?.code === '0000' && levelRes?.code === '0000') this.modal.close({ value: true });

      this.appService.showToastSubject.next({
        msgLang: basicRes?.code === '0000' ? 'member.model.manageModelHint1' : 'member.model.manageModelHint2',
        successed: basicRes?.code === '0000',
      });
      if (levelRes?.code === '3206') {
        this.appService.showToastSubject.next({
          msg: levelRes?.message,
          successed: false,
        });
      } else {
        this.appService.showToastSubject.next({
          msgLang: levelRes?.code === '0000' ? 'member.model.manageModelHint3' : 'member.model.manageModelHint4',
          successed: levelRes?.code === '0000',
        });
      }
    });
  }
}
