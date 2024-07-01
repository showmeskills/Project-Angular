import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { AboutUsService } from './../../about-us.service';

@UntilDestroy()
@Component({
  selector: 'app-job-vacancy',
  templateUrl: './job-vacancy.component.html',
  styleUrls: ['./job-vacancy.component.scss'],
})
export class JobVacancyComponent implements OnInit {
  jobCateList: any[] = [];

  jobLocationList: any[] = [
    { id: 0, name: this.localeService.getValue('place') },
    { id: 1, name: this.localeService.getValue('local_b') },
    { id: 2, name: this.localeService.getValue('taiw00') },
    { id: 3, name: this.localeService.getValue('remot00') },
  ];

  loading: boolean = false;

  jobCate: string = '';

  jobLocation: number = 0;

  jobsList: any[] = [];

  searchKeyWord: string = '';

  isH5!: boolean;

  total: number = 0;

  @Input() cateId!: number;

  selectJobTitle: string = this.localeService.getValue('all');

  selectJobLocal: string = this.localeService.getValue('place');

  /** 所有list */
  allList: any[] = [];

  constructor(
    private router: Router,
    private aboutUsService: AboutUsService,
    private layout: LayoutService,
    private appService: AppService,
    private localeService: LocaleService
  ) {}

  ngOnInit(): void {
    // 工作种类
    this.aboutUsService.detailRoute$.pipe(untilDestroyed(this)).subscribe(list => {
      this.jobCateList = list;
    });
    //工作列表
    this.aboutUsService.jobsList$.pipe(untilDestroyed(this)).subscribe(list => {
      if (this.cateId != undefined) {
        this.jobsList = list.filter((item: any) => item.id == this.cateId);
      } else {
        this.jobsList = list;
      }
    });

    //工作总数
    this.onCalcTotal();

    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
  }

  /** 下拉筛选工作*/
  onChangeJob() {
    if (this.jobCate === '' && this.jobLocation === 0) {
      this.jobsList = this.aboutUsService.mockJobList;
    } else if (this.jobCate !== '' && this.jobLocation === 0) {
      this.jobsList = this.aboutUsService.mockJobList.filter((list: any) => list.id === this.jobCate);
    } else if (this.jobCate === '' && this.jobLocation !== 0) {
      this.jobsList = this.aboutUsService.mockJobList
        .map((item: any) => {
          const addressList = item.list.filter((job: any) => {
            const checkValue = job.jobLocationId.includes(this.jobLocation);
            if (checkValue) {
              return job;
            }
          });
          return {
            ...item,
            list: addressList,
          };
        })
        .filter((item: any) => item.list.length !== 0);
    } else if (this.jobCate !== '' && this.jobLocation !== 0) {
      this.jobsList = this.aboutUsService.mockJobList
        .filter((list: any) => list.id === this.jobCate)
        .map((item: any) => {
          const addressList = item.list.filter((job: any) => {
            const checkValue = job.jobLocationId.includes(this.jobLocation);
            if (checkValue) {
              return job;
            }
          });
          return {
            ...item,
            list: addressList,
          };
        })
        .filter((item: any) => item.list.length !== 0);
    }
    this.onCalcTotal();
    this.searchKeyWord = '';
  }

  /**
   * 当为空时 显示所有数据
   *
   * @param value
   */
  onValueChange(value: any) {
    if (value.length === 0) {
      this.jobsList = this.aboutUsService.mockJobList;
      this.onChangeJob();
    }
    this.onCalcTotal();
  }

  /** 模糊查询 */
  onSearch() {
    if (!this.searchKeyWord) return;
    this.jobCate = '';
    this.jobLocation = 0;
    this.jobsList = this.aboutUsService.mockJobList
      .map((item: any) => {
        const jobList = item.list.filter((job: any) => {
          return job.job.toLowerCase().indexOf(this.searchKeyWord.toLowerCase()) !== -1;
        });
        return {
          ...item,
          list: jobList,
        };
      })
      .filter((item: any) => item.list.length !== 0);
    this.onCalcTotal();
  }

  /** 计算所有工作数量 */
  onCalcTotal() {
    this.total = 0;
    this.jobsList.forEach(item => {
      this.total += item.total;
    });
  }

  /**
   * 直接去申请 或者 工作list 页面
   *
   * @param page
   * @param jobCateId
   * @param isApply
   */
  jumpToPage(page: string, jobCateId: number, isApply: boolean) {
    let queryParams = {};
    if (isApply) {
      queryParams = {
        id: jobCateId,
      };
    } else {
      queryParams = {
        jobId: jobCateId,
      };
    }
    this.router.navigate([this.appService.languageCode, 'about-us', 'jobs', page, jobCateId], {
      queryParams,
    });
  }

  /**
   * 返回上一页面
   *
   * @param page 页面路由
   */
  backPage(page: string) {
    this.router.navigateByUrl(this.appService.languageCode + page);
  }

  /** 清楚所有选项 */
  clear() {
    this.jobCate = '';
    this.jobLocation = 0;
    this.searchKeyWord = '';
    this.jobsList = this.aboutUsService.mockJobList;
  }
}
