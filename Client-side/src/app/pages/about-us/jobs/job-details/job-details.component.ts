import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { AboutUsService } from './../../about-us.service';

@UntilDestroy()
@Component({
  selector: 'app-job-details',
  templateUrl: './job-details.component.html',
  styleUrls: ['./job-details.component.scss'],
})
export class JobDetailsComponent implements OnInit {
  cateId!: number;
  pageTitle!: string;
  isH5!: boolean;
  bannerText!: string;
  bannerUrl!: string;
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private aboutUsService: AboutUsService,
    private layout: LayoutService,
    private appService: AppService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.queryParams.pipe(untilDestroyed(this)).subscribe(e => {
      this.cateId = e?.id;
    });
    this.aboutUsService.jobBanner.pipe(untilDestroyed(this)).subscribe(e => {
      e.forEach((item: any) => {
        if (item.id == this.cateId) {
          this.pageTitle = item.name;
          this.bannerText = item.text;
          this.bannerUrl = item.imgPath;
        }
      });
    });
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
  }
  jumpToPage(jobId: number) {
    this.router.navigate([this.appService.languageCode, 'about-us', 'jobs', 'applications', jobId], {
      queryParams: {
        jobId: jobId,
      },
    });
  }
}
