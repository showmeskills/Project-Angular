import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { NativeAppService } from 'src/app/shared/service/native-app.service';
import { LocaleService } from '../../../../../shared/service/locale.service';
import { FriendService } from '../../../friend.service';
@UntilDestroy()
@Component({
  selector: 'app-application-check',
  templateUrl: './application-check.component.html',
  styleUrls: ['./application-check.component.scss'],
})
export class ApplicationCheckComponent implements OnInit {
  agentApplyStatus!: number;
  isH5!: boolean;
  status: any[] = [];
  redBarWith!: number;
  redBarHeight!: number;
  statusText: string = '';
  btnText: string = '';
  isActiveIdx!: number;
  page!: string;
  loading!: boolean;
  tips!: string;
  constructor(
    private layout: LayoutService,
    private appService: AppService,
    private friendService: FriendService,
    private router: Router,
    private localeService: LocaleService,
    private nativeAppService: NativeAppService
  ) {}

  ngOnInit(): void {
    this.nativeAppService.setNativeTitle('agent_p');
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(v => (this.isH5 = v));
    this.getAgentApplyStatus();
  }

  async getAgentApplyStatus() {
    this.loading = true;
    this.friendService.getAgentApplyStatus().then(data => {
      this.agentApplyStatus = data;
      this.friendService.agentApplyStatus$.next(data);
      this.loading = false;
      switch (this.agentApplyStatus) {
        case 0:
          this.jumpToPage('referral/home');
          break;
        case 10000:
          this.jumpToPage('referral/application?whichRouter=affiliate');
          break;
        case 10002:
          if (this.isH5) {
            this.redBarHeight = 180;
          } else {
            this.redBarWith = 50;
          }
          this.status = [
            {
              icon: 'icon-success',
              num: null,
              active: true,
              text: 'form',
            },
            {
              icon: null,
              num: 2,
              active: true,
              text: 'check',
            },
            {
              icon: null,
              num: 3,
              active: false,
              text: 'done',
            },
          ];
          this.statusText = this.localeService.getValue('status_wait');
          this.btnText = this.localeService.getValue('back');
          this.tips = this.localeService.getValue('waiting_two');
          this.isActiveIdx = 1;
          this.page = 'referral/home';
          break;
        case 10003:
          if (this.isH5) {
            this.redBarHeight = 360;
          } else {
            this.redBarWith = 100;
          }
          this.status = [
            {
              icon: 'icon-success',
              num: null,
              active: true,
              text: 'form',
            },
            {
              icon: 'icon-success',
              num: null,
              active: true,
              text: 'check',
            },
            {
              icon: 'icon-success',
              num: null,
              active: true,
              text: 'done',
            },
          ];
          this.statusText = this.localeService.getValue('no_apply');
          this.btnText = this.localeService.getValue('back');
          this.tips = this.localeService.getValue('cantact_service');
          this.isActiveIdx = 2;
          this.page = 'referral/affiliate';
          break;
        case 10004:
          if (this.isH5) {
            this.redBarHeight = 360;
          } else {
            this.redBarWith = 100;
          }
          this.status = [
            {
              icon: 'icon-success',
              num: null,
              active: true,
              text: 'form',
            },
            {
              icon: 'icon-success',
              num: null,
              active: true,
              text: 'check',
            },
            {
              icon: 'icon-success',
              num: null,
              active: true,
              text: 'done',
            },
          ];
          this.statusText = this.localeService.getValue('try_again');
          this.btnText = this.localeService.getValue('apply_agagin');
          this.tips = this.localeService.getValue('cantact_service');
          this.isActiveIdx = 2;
          this.page = 'referral/application/affiliate/openForm';
          break;
      }
    });
  }

  jumpToPage(page: string) {
    this.router.navigateByUrl(`/${this.appService.languageCode}/` + page);
  }
}
