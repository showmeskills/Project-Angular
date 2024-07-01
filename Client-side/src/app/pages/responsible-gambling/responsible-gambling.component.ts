import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { ResponsibleGamblingService } from './responsible-gambling.service';
@UntilDestroy()
@Component({
  selector: 'app-responsible-gambling',
  templateUrl: './responsible-gambling.component.html',
  styleUrls: ['./responsible-gambling.component.scss'],
})
export class ResponsibleGamblingComponent implements OnInit {
  constructor(
    private layout: LayoutService,
    private responsibleGamblingService: ResponsibleGamblingService,
  ) {}

  isH5!: boolean;

  /**@navTitle 头部导航左边文字 */
  navTitle!: string;

  /**@navList 头部导航文字 */
  navList: string[] = ['gam_moderate_r', 'con_gambling', 'support_advise', 'contract_us'];

  /**@navActiveIdx 头部导航激活下标*/
  navActiveIdx: number = 0;

  /**@footerItem 底部导航 */
  footerList: string[] = ['question', 'con_gambling', 'tmp_leave', 'support_advise', 'protect_young', 'contract_us'];

  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    this.navTitle = this.navList[this.navActiveIdx];
  }

  commingSoon() {
    this.responsibleGamblingService.commingSoon();
  }
}
