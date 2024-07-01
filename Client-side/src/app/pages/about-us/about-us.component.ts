import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';

interface INavLIst {
  name: string;
  path: string;
}

@UntilDestroy()
@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss'],
})
export class AboutUsComponent implements OnInit {
  isH5!: boolean;
  currentPageTitle!: string; //当前页主题
  navList: INavLIst[] = [
    {
      name: this.localeService.getValue('abount_us'),
      path: `/${this.appService.languageCode}/about-us/home`,
    },
    {
      name: this.localeService.getValue('job_oppor'),
      path: `/${this.appService.languageCode}/about-us/work`,
    },
  ];
  constructor(
    private layout: LayoutService,
    private router: Router,
    private appService: AppService,
    private localeService: LocaleService
  ) {}

  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    if (this.router.url == this.navList[0].path) {
      this.onRouterlinkActive(0);
    } else {
      this.onRouterlinkActive(1);
    }
  }

  onRouterlinkActive(idx: number): void {
    this.currentPageTitle = this.navList[idx].name;
  }
}
