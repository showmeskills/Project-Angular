import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { ImgCarouselOptions } from 'src/app/shared/components/img-carousel/img-carousel-options.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
@UntilDestroy()
@Component({
  selector: 'app-job-opportunity',
  templateUrl: './job-opportunity.component.html',
  styleUrls: ['./job-opportunity.component.scss'],
})
export class JobOpportunityComponent implements OnInit {
  teamList: any[] = [
    {
      name: this.localeService.getValue('job_a'),
      url: 'assets/images/about-us/accounting.svg',
      path: 'about-us/jobs/detail/0?id=0',
    },
    {
      name: this.localeService.getValue('job_c'),
      url: 'assets/images/about-us/marketing.svg',
      path: 'about-us/jobs/detail/2?id=2',
    },
    {
      name: this.localeService.getValue('job_b'),
      url: 'assets/images/about-us/design.svg',
      path: 'about-us/jobs/detail/1?id=1',
    },
    {
      name: this.localeService.getValue('job_d'),
      url: 'assets/images/about-us/operation.svg',
      path: 'about-us/jobs/detail/3?id=3',
    },
    {
      name: this.localeService.getValue('job_e'),
      url: 'assets/images/about-us/customer-service.svg',
      path: 'about-us/jobs/detail/4?id=4',
    },
    {
      name: this.localeService.getValue('job_f'),
      url: 'assets/images/about-us/hr.svg',
      path: 'about-us/jobs/detail/5?id=5',
    },
    {
      name: this.localeService.getValue('job_g'),
      url: 'assets/images/about-us/tech.svg',
      path: 'about-us/jobs/detail/6?id=6',
    },
  ];

  selectedList: any[] = [
    {
      url: 'assets/images/about-us/pg-1.svg',
      list: [
        this.localeService.getValue('sen_aw'),
        this.localeService.getValue('sen_ax'),
        this.localeService.getValue('sen_ay'),
        this.localeService.getValue('sen_az'),
      ],
    },
    {
      url: 'assets/images/about-us/pg-2.svg',
      list: [
        this.localeService.getValue('sen_ba'),
        this.localeService.getValue('sen_bb'),
        this.localeService.getValue('sen_bc'),
        this.localeService.getValue('sen_bd'),
      ],
    },
    {
      url: 'assets/images/about-us/pg-3.svg',
      list: [
        this.localeService.getValue('sen_bi'),
        this.localeService.getValue('sen_bj'),
        this.localeService.getValue('sen_bk'),
        this.localeService.getValue('sen_kl'),
      ],
    },
  ];

  processList: any[] = [
    this.localeService.getValue('sen_as'),
    this.localeService.getValue('sen_at'),
    this.localeService.getValue('sen_au'),
    this.localeService.getValue('sen_av'),
  ];

  swiperList: any[] = [
    {
      url: 'assets/images/about-us/swiper-1.svg',
      title: this.localeService.getValue('sen_km'),
      content: this.localeService.getValue('sen_kt'),
    },
    {
      url: 'assets/images/about-us/swiper-2.svg',
      title: this.localeService.getValue('sen_kn'),
      content: this.localeService.getValue('sen_ko'),
    },
    {
      url: 'assets/images/about-us/swiper-3.svg',
      title: this.localeService.getValue('sen_kr'),
      content: this.localeService.getValue('sen_ks'),
    },
  ];

  isH5!: boolean;
  swiperOptions: ImgCarouselOptions = {
    loop: true,
    autoplay: true,
    pagination: true,
  };
  constructor(
    private layout: LayoutService,
    private router: Router,
    private appService: AppService,
    private localeService: LocaleService
  ) {}

  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
  }

  jumpToPage(page: string) {
    this.router.navigateByUrl(`/${this.appService.languageCode}/` + page);
  }
}
