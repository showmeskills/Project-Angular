import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { AboutUsService } from '../../about-us.service';

@UntilDestroy()
@Component({
  selector: 'app-job-application',
  templateUrl: './job-application.component.html',
  styleUrls: ['./job-application.component.scss'],
})
export class JobApplicationComponent implements OnInit {
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private aboutUsService: AboutUsService,
    private layout: LayoutService,
    private appService: AppService
  ) {}

  /**@localeContent 本地文章内容;多语言 */
  localeContent: string = '';

  /**@contentLoading 本地文章的loading */
  contentLoading: boolean = false;

  /**@jobTitle job title */
  jobTitle!: string;

  /**@jobLocation 工作场所 */
  jobLocation!: string;

  isH5!: boolean;
  ngOnInit(): void {
    combineLatest([this.activatedRoute.queryParamMap, this.aboutUsService.jobsList$])
      .pipe(untilDestroyed(this))
      .subscribe(([params, jobsList]) => {
        const jobId = params.get('jobId')!;
        jobsList.forEach((item: any) => {
          item.list.forEach((list: any) => {
            if (jobId == list.id) {
              this.jobTitle = list.job;
              this.jobLocation = list.location;
            }
          });
        });
        if (jobId) this.getLocaleTmp(jobId);
      });

    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
  }

  getLocaleTmp(jobId: string) {
    this.contentLoading = true;
    fetch(`assets/resources/pages/jobs-detail/${jobId}/${this.appService.languageCode}.html`)
      .then(res => res.text())
      .then(data => {
        this.contentLoading = false;
        this.localeContent = data;
      })
      .catch(err => {
        this.contentLoading = false;
        console.log(err);
      });
  }

  jumpToPage(page: string) {
    this.router.navigateByUrl(this.appService.languageCode + page);
  }
}
