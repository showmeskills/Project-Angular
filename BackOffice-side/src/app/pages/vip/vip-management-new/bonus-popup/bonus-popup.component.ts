import { cloneDeep } from 'lodash';
import { Component, Input, OnInit } from '@angular/core';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { VipApi } from 'src/app/shared/api/vip.api';
import { zip, tap, finalize } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { InputFloatDirective } from 'src/app/shared/directive/input.directive';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';

@Component({
  selector: 'vip-management-bonus-popup',
  templateUrl: './bonus-popup.component.html',
  styleUrls: ['./bonus-popup.component.scss'],
  standalone: true,
  imports: [
    ModalTitleComponent,
    LoadingDirective,
    FormsModule,
    NgFor,
    NgIf,
    AngularSvgIconModule,
    NgTemplateOutlet,
    EmptyComponent,
    FormWrapComponent,
    InputFloatDirective,
    LangPipe,
  ],
})
export class VipManagementNewBonusPopupComponent implements OnInit {
  constructor(
    public modal: MatModalRef<VipManagementNewBonusPopupComponent, boolean>,
    private vipApi: VipApi,
    private appService: AppService
  ) {}

  @Input() tenantId: string;

  /** 模版基础配置 */
  templateInfoData: any = {};
  templateInfoLoading = true;

  /** 等级配置 */
  levelGroupList: any[] = [];
  levelGroupLoading = true;

  /** 等级配置 - 表头数据 */
  disableList: string[] = [];
  thList: any[] = [
    { name: '等级', lang: 'member.management.vipc.level' },
    { name: '成长值积分', value: 'upgradePoints', lang: 'member.management.vipc.upgradePoints' },
    { name: '升级红包LED', value: 'upgradeBonus', lang: 'member.management.vipc.upgradeUsdtPackage' },
    { name: '体育Rakebake', value: 'sportsCashback', lang: 'member.management.vipc.sportsRakebake' },
    { name: '真人娱乐场Rakebake', value: 'liveCashback', lang: 'member.management.vipc.liveRakebake' },
    { name: '娱乐场Rakebake', value: 'casinoCashback', lang: 'member.management.vipc.casinoRakebake' },
    { name: '棋牌Rakebake', value: 'chessCashback', lang: 'member.management.vipc.chessRakebake' },
    { name: '生日礼金', value: 'birthdayBonus', lang: 'member.management.vipc.birthdayBonus' },
    { name: '单日反水上限', value: 'dailyCashbackLimit', lang: 'member.management.vipc.dailyCashbackLimit' },
    { name: '登录红包', value: 'loginRedPackage', lang: 'member.table.loginRedPacket' },
    { name: '首存红利比例', value: 'firstDepositBonus', lang: 'member.table.firstBonusProportion' },
    { name: '首存红利上限', value: 'firstDepositMax', lang: 'member.table.firstBonuslimit' },
    { name: '最大提款倍数', value: 'dayWithdrawLimitMoney', lang: 'member.management.vipc.maxWithdrawalFactor' },
    { name: '自动返水金额上限', value: 'autoCashbackLimit', lang: 'member.management.vipc.autoCashbackLimit' },
    { name: '单日免费提款次数', value: 'freeWithdrawalsPerDay', lang: 'member.table.withdrawlCount' },
    { name: '提款手续费比例', value: 'withdrawalFeeProportion', lang: 'member.table.withdrawalFeeP' },
    { name: '单笔手续费上限（USDT）', value: 'dailyFeeLimit', lang: 'member.table.withdrawalFeeMax' },
  ];

  get thValueList() {
    return this.thList.map((v) => v.value).filter((j) => j);
  }

  ngOnInit() {
    zip(this.vip_manage_template_info(), this.listlevelbygroup()).subscribe();
  }

  /** 基础配置 - 获取 */
  vip_manage_template_info() {
    this.templateInfoLoading = true;
    return this.vipApi.vip_manage_template_info({}, this.tenantId).pipe(
      tap((res) => {
        this.templateInfoData = res?.data || {};
      }),
      finalize(() => (this.templateInfoLoading = false))
    );
  }

  /** 基础配置 - 更新 */
  vip_manage_template_updateinfo() {
    if (!this.templateInfoData?.svipKeepTime || !this.templateInfoData?.svipInviteTime) {
      this.appService.showToastSubject.next({
        msg: '基础配置数据为空，无法进行更新！',
      });
      return;
    }

    const parmas = {
      templateId: this.templateInfoData?.templateId,
      svipKeepTime: this.templateInfoData?.svipKeepTime,
      svipInviteTime: this.templateInfoData?.svipInviteTime,
    };

    this.templateInfoLoading = true;
    this.vipApi.vip_manage_template_updateinfo(parmas, this.tenantId).subscribe((res) => {
      this.templateInfoLoading = false;

      this.appService.showToastSubject.next({
        msgLang: res?.code === '0000' ? 'member.model.manageModelHint1' : 'member.model.manageModelHint2',
        successed: res?.code === '0000' ? true : false,
      });

      if (res?.code === '0000') this.vip_manage_template_info().subscribe();
    });
  }

  /** 等级配置 - 表头勾选禁用逻辑 */
  thSelectChange(item: any) {
    const index = this.disableList.indexOf(item.value);
    if (item.checked) {
      if (index === -1) this.disableList.push(item.value);
    } else {
      if (index > -1) this.disableList.splice(index, 1);
    }
  }

  /** 等级配置 - 获取 */
  listlevelbygroup() {
    this.levelGroupLoading = true;
    return this.vipApi.listlevelbygroup({}, this.tenantId).pipe(
      tap((res) => {
        this.levelGroupList = res?.data || [];

        if (this.levelGroupList.length > 0) {
          this.levelGroupList.forEach((a, i) => {
            a.expand = false;

            if (a.vipLevelResDtoList.length > 0) {
              // 抽取详情数据的第一条，判断如果表头字段为负数，则进行表头勾选联动
              this.thList.forEach((th, k) => {
                if (a.vipLevelResDtoList[0][th.value] < 0) {
                  this.thList[k].checked = true;
                  this.thSelectChange(th);
                }

                // 对返回的详情数据进行负数转正
                a.vipLevelResDtoList.forEach((b, j) => {
                  this.levelGroupList[i].vipLevelResDtoList[j][th.value] = Math.abs(b[th.value]);
                });
              });
            }
          });
        }
      }),
      finalize(() => (this.levelGroupLoading = false))
    );
  }

  /** 等级配置 - 更新 */
  batchupdateinfo() {
    if (!this.levelGroupList.length) {
      this.appService.showToastSubject.next({
        msgLang: 'member.management.vipc.welfareConfigurationFailMsg',
      });
      return;
    }

    const editList: any = cloneDeep(this.levelGroupList);
    // 如果有表头勾选禁用，进行数值负数处理
    if (this.disableList.length > 0) {
      editList.forEach((a, i) => {
        a.vipLevelResDtoList.forEach((b, j) => {
          Object.keys(b).forEach((key) => {
            this.disableList.forEach((disable) => {
              if (key === disable) editList[i].vipLevelResDtoList[j][key] = -Math.abs(b[key]);
            });
          });
        });
      });
    }

    const parmas = editList.map((v) => v.vipLevelResDtoList).flat(Infinity);

    this.levelGroupLoading = true;
    this.vipApi.batchupdateinfo(parmas, this.tenantId).subscribe((res) => {
      this.levelGroupLoading = false;

      this.appService.showToastSubject.next({
        msgLang: res?.code === '0000' ? 'member.model.manageModelHint3' : 'member.model.manageModelHint4',
        successed: res?.code === '0000',
      });

      if (res?.code === '0000') this.listlevelbygroup().subscribe();
    });
  }

  confirm() {
    this.vip_manage_template_updateinfo();
    this.batchupdateinfo();
  }
}
