import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { AboutUsService } from './../../about-us.service';

const LABEL_NAME = 'LABEL_NAME';
@UntilDestroy()
@Component({
  selector: 'app-jobs-nav',
  templateUrl: './jobs-nav.component.html',
  styleUrls: ['./jobs-nav.component.scss'],
})
export class JobsNavComponent implements OnInit {
  nav: any[] = [
    { label: this.localeService.getValue('nav_a'), url: `/${this.appService.languageCode}/about-us/work` },
    { label: this.localeService.getValue('nav_b'), url: `/${this.appService.languageCode}/about-us/jobs/vacancy` },
    { label: '', url: '' },
    { label: this.localeService.getValue('nav_c'), url: '' },
    { label: this.localeService.getValue('nav_d'), url: `/${this.appService.languageCode}/about-us/jobs/hr` },
  ];
  navList: any[] = [];
  isActiveNavIdx: number = 0;
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private layout: LayoutService,
    private absoutUsService: AboutUsService,
    private appService: AppService,
    private localeService: LocaleService
  ) {}

  ngOnInit(): void {
    this.layout.page$.pipe().subscribe(e => {
      this.activatedRoute.routeConfig?.children?.forEach((route, i) => {
        if (this.layout.getComponentTree()[3] == route.component) {
          this.isActiveNavIdx = i + 1; //导航激活下标
          if (i == 1) {
            // 获取动态label
            this.activatedRoute.queryParams.pipe(untilDestroyed(this)).subscribe((item: any) => {
              this.absoutUsService.detailRoute$.pipe(untilDestroyed(this)).subscribe(e => {
                e.forEach((i: any) => {
                  if (i.id == item.id) {
                    this.nav[2].label = i.name;
                  }
                });
              });
              this.nav[2].url = `/${this.appService.languageCode}/about-us/jobs/detail/${item.id}?id=${item.id}`;
              //发布一下 当HR页面返回的时候可以获取路由
              if (item.id != undefined) {
                this.absoutUsService.jobListRoute.next(
                  `/${this.appService.languageCode}/about-us/jobs/detail/${item.id}?id=${item.id}`
                );
              }
              if (this.nav[2].label.length > 0) {
                sessionStorage.setItem(LABEL_NAME, JSON.stringify(this.nav[2].label));
              }
            });
          }
          if (i == 2) {
            // 直接进入申请页面和说明页
            this.activatedRoute.queryParams.pipe(untilDestroyed(this)).subscribe((item: any) => {
              this.absoutUsService.jobsList$.pipe(untilDestroyed(this)).subscribe(e => {
                e.forEach((i: any) => {
                  i.list.forEach((lis: any) => {
                    if (lis.id == item.jobId) {
                      this.nav[2].label = i.cate;
                      this.nav[2].url = `/${this.appService.languageCode}/about-us/jobs/detail/${i.id}?id=${i.id}`;
                      if (i.id != undefined) {
                        sessionStorage.setItem(LABEL_NAME, JSON.stringify(this.nav[2].label));
                        this.absoutUsService.jobListRoute.next(
                          `/${this.appService.languageCode}/about-us/jobs/detail/${i.id}?id=${i.id}`
                        );
                      }
                    }
                  });
                });
              });
              this.nav[3].url = `/${this.appService.languageCode}/about-us/jobs/applications/${item.jobId}?jobId=${item.jobId}`;
              //发布一下 当HR页面返回的时候可以获取路由
              if (item.jobId != undefined) {
                this.absoutUsService.applicationRoute.next(
                  `/${this.appService.languageCode}/about-us/jobs/applications/${item.jobId}?jobId=${item.jobId}`
                );
              }
            });
          }
          if (i == 3) {
            // 从HR 返回到工作List 页面
            this.absoutUsService.jobListRoute.pipe(untilDestroyed(this)).subscribe(url => {
              this.nav[2].url = url;
            });
            // 从HR 返回到申请页面
            this.absoutUsService.applicationRoute.pipe(untilDestroyed(this)).subscribe(url => {
              this.nav[3].url = url;
            });
          }
          // 截取数组
          this.navList = this.nav.slice(0, i + 2);
        }
      });
      if (this.nav[2].label.length == 0) {
        // 刷新页面做缓存
        this.nav[2].label = JSON.parse(sessionStorage.getItem(LABEL_NAME)!);
      }
    });
  }

  ngOnDestroy(): void {
    sessionStorage.removeItem(LABEL_NAME);
  }

  jumpToPage(item: any) {
    this.router.navigateByUrl(item.url);
  }
}
