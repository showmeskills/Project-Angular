import { AfterViewInit, Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { LayoutService } from 'src/app/shared/service/layout.service';

@UntilDestroy()
@Component({
  selector: 'app-configure',
  templateUrl: './configure.component.html',
  styleUrls: ['./configure.component.scss'],
})
export class ConfigureComponent implements OnInit, AfterViewInit {
  constructor(private layout: LayoutService) {}

  isH5!: boolean;
  menu = [
    {
      name: '我的活动',
      page: 'activities',
    },
    {
      name: '存款限制',
      page: 'deposit-limit',
    },
    {
      name: '暂停',
      page: 'suspend',
    },
    {
      name: '自我禁止',
      page: 'self-prohibit',
    },
    {
      name: '关闭账户',
      page: 'close-account',
    },
    {
      name: '活动提醒',
      page: 'remind',
    },
  ];

  ngOnInit() {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(x => (this.isH5 = x));
  }

  ngAfterViewInit() {
    this.checkScroll();
  }

  checkScroll() {
    setTimeout(() => {
      const item: HTMLElement | null = document.querySelector('app-configure .menu-item.active');
      const menu: HTMLElement | null = document.querySelector('app-configure .menu ul');
      if (item && menu) menu.scrollLeft = item.offsetLeft <= 20 ? 0 : item.offsetLeft;
    });
  }
}
