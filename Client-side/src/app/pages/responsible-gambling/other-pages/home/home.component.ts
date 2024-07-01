import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { ResponsibleGamblingService } from '../../responsible-gambling.service';

@UntilDestroy()
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  constructor(
    private layout: LayoutService,
    private responsibleGamblingService: ResponsibleGamblingService,
    private router: Router,
    public appService: AppService,
  ) {}
  isH5!: boolean;

  /**@toolList tool导航 */
  toolList: any[] = [
    {
      text: 'my_act',
      info: 'keep_track',
      url: 'assets/images/responsible-gambling/time.svg',
    },
    {
      text: 'dep_limit',
      info: 'dep_limit_sen',
      url: 'assets/images/responsible-gambling/coin.svg',
    },
    {
      text: 'act_alarm',
      info: 'act_alarm_sen',
      url: 'assets/images/responsible-gambling/alarm.svg',
    },
    {
      text: 'stop',
      info: 'stop_leave',
      url: 'assets/images/responsible-gambling/hourglass.svg',
    },
    {
      text: 'self_manage',
      info: 'self_control',
      url: 'assets/images/responsible-gambling/prohibit.svg',
    },
  ];
  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
  }

  commingSoon() {
    this.responsibleGamblingService.commingSoon();
  }
}
