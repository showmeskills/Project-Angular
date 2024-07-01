import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LocaleService } from 'src/app/shared/service/locale.service';

@Injectable({
  providedIn: 'root',
})
export class AboutUsService {
  constructor(private localeService: LocaleService) {}
  mockDetailRoute: any = [
    { id: '', name: this.localeService.getValue('all') },
    { id: 0, name: this.localeService.getValue('job_a') },
    { id: 1, name: this.localeService.getValue('job_b') },
    { id: 2, name: this.localeService.getValue('job_c') },
    { id: 3, name: this.localeService.getValue('job_d') },
    { id: 4, name: this.localeService.getValue('job_e') },
    { id: 5, name: this.localeService.getValue('job_f') },
    { id: 6, name: this.localeService.getValue('job_g') },
  ];

  mockJobList = [
    {
      id: 0,
      cate: this.localeService.getValue('job_a'),
      url: 'assets/images/about-us/accounting.svg',
      list: [
        {
          id: 0,
          job: this.localeService.getValue('admin_job'),
          location: this.localeService.getValue('job_location_a'),
          jobLocationId: [1, 2],
        },
        {
          id: 1,
          job: this.localeService.getValue('title_a'),
          location: this.localeService.getValue('job_location_a'),
          jobLocationId: [1, 2],
        },
        {
          id: 2,
          job: this.localeService.getValue('accountant_afm'),
          location: this.localeService.getValue('job_location_a'),
          jobLocationId: [1, 2],
        },
        {
          id: 3,
          job: this.localeService.getValue('general_accountant'),
          location: this.localeService.getValue('job_location_a'),
          jobLocationId: [1, 2],
        },
        {
          id: 4,
          job: this.localeService.getValue('junior_accountant'),
          location: this.localeService.getValue('job_location_a'),
          jobLocationId: [1, 2],
        },
        {
          id: 5,
          job: this.localeService.getValue('senior_accountant'),
          location: this.localeService.getValue('job_location_a'),
          jobLocationId: [1, 2],
        },
      ],
      total: 6,
    },
    {
      id: 1,
      cate: this.localeService.getValue('job_b'),
      url: 'assets/images/about-us/design.svg',
      list: [
        {
          id: 6,
          job: this.localeService.getValue('title_b'),
          location: this.localeService.getValue('job_location_b'),
          jobLocationId: [1, 2, 3],
        },
        {
          id: 7,
          job: this.localeService.getValue('title_c'),
          location: this.localeService.getValue('job_location_b'),
          jobLocationId: [1, 2, 3],
        },
        {
          id: 8,
          job: this.localeService.getValue('title_w'),
          location: this.localeService.getValue('job_location_b'),
          jobLocationId: [1, 2, 3],
        },
        {
          id: 9,
          job: this.localeService.getValue('title_x'),
          location: this.localeService.getValue('job_location_b'),
          jobLocationId: [1, 2, 3],
        },
        {
          id: 10,
          job: this.localeService.getValue('title_y'),
          location: this.localeService.getValue('job_location_b'),
          jobLocationId: [1, 2, 3],
        },
        {
          id: 11,
          job: this.localeService.getValue('title_z'),
          location: this.localeService.getValue('job_location_b'),
          jobLocationId: [1, 2, 3],
        },
      ],
      total: 6,
    },
    {
      id: 2,
      cate: this.localeService.getValue('job_c'),
      url: 'assets/images/about-us/marketing.svg',
      list: [
        {
          id: 12,
          job: this.localeService.getValue('title_aa'),
          location: this.localeService.getValue('job_location_c'),
          jobLocationId: [1, 3],
        },
        {
          id: 13,
          job: this.localeService.getValue('title_ab'),
          location: this.localeService.getValue('job_location_c'),
          jobLocationId: [1, 3],
        },
        {
          id: 14,
          job: this.localeService.getValue('title_ac'),
          location: this.localeService.getValue('job_location_c'),
          jobLocationId: [1, 3],
        },
        {
          id: 15,
          job: this.localeService.getValue('title_ad'),
          location: this.localeService.getValue('job_location_c'),
          jobLocationId: [1, 3],
        },
        {
          id: 16,
          job: this.localeService.getValue('title_ae'),
          location: this.localeService.getValue('job_location_c'),
          jobLocationId: [1, 3],
        },
      ],
      total: 5,
    },
    {
      id: 3,
      cate: this.localeService.getValue('job_d'),
      url: 'assets/images/about-us/operation.svg',
      list: [
        {
          id: 17,
          job: this.localeService.getValue('title_s'),
          location: this.localeService.getValue('job_location_c'),
          jobLocationId: [1, 3],
        },
        {
          id: 18,
          job: this.localeService.getValue('title_t'),
          location: this.localeService.getValue('job_location_c'),
          jobLocationId: [1, 3],
        },
        {
          id: 19,
          job: this.localeService.getValue('title_u'),
          location: this.localeService.getValue('job_location_c'),
          jobLocationId: [1, 3],
        },
        {
          id: 20,
          job: this.localeService.getValue('title_v'),
          location: this.localeService.getValue('job_location_c'),
          jobLocationId: [1, 3],
        },
      ],
      total: 4,
    },
    {
      id: 4,
      cate: this.localeService.getValue('job_e'),
      url: 'assets/images/about-us/customer-service.svg',
      list: [
        {
          id: 21,
          job: this.localeService.getValue('title_p'),
          location: this.localeService.getValue('job_location_c'),
          jobLocationId: [1, 3],
        },
        {
          id: 22,
          job: this.localeService.getValue('title_r'),
          location: this.localeService.getValue('job_location_c'),
          jobLocationId: [1, 3],
        },
        {
          id: 30,
          job: this.localeService.getValue('title_k'),
          location: this.localeService.getValue('job_location_c'),
          jobLocationId: [1, 3],
        },
      ],
      total: 3,
    },
    {
      id: 5,
      cate: this.localeService.getValue('job_f'),
      url: 'assets/images/about-us/hr.svg',
      list: [
        {
          id: 23,
          job: this.localeService.getValue('benefit_special'),
          location: this.localeService.getValue('job_location_c'),
          jobLocationId: [1, 3],
        },
        {
          id: 24,
          job: this.localeService.getValue('title_o'),
          location: this.localeService.getValue('job_location_c'),
          jobLocationId: [1, 3],
        },
        {
          id: 25,
          job: this.localeService.getValue('title_n'),
          location: this.localeService.getValue('job_location_c'),
          jobLocationId: [1, 3],
        },
        {
          id: 26,
          job: this.localeService.getValue('business_partner'),
          location: this.localeService.getValue('job_location_c'),
          jobLocationId: [1, 3],
        },
        {
          id: 27,
          job: this.localeService.getValue('recruitment_specialist'),
          location: this.localeService.getValue('job_location_d'),
          jobLocationId: [1, 2],
        },
        {
          id: 28,
          job: this.localeService.getValue('visa_specialist'),
          location: this.localeService.getValue('job_location_c'),
          jobLocationId: [1, 3],
        },
      ],
      total: 6,
    },
    {
      id: 6,
      cate: this.localeService.getValue('job_g'),
      url: 'assets/images/about-us/tech.svg',
      list: [
        {
          id: 29,
          job: this.localeService.getValue('title_d'),
          location: this.localeService.getValue('local_c'),
          jobLocationId: [2, 3],
        },
        {
          id: 31,
          job: this.localeService.getValue('title_l'),
          location: this.localeService.getValue('local_c'),
          jobLocationId: [2, 3],
        },
        {
          id: 32,
          job: this.localeService.getValue('title_m'),
          location: this.localeService.getValue('local_c'),
          jobLocationId: [2, 3],
        },
        {
          id: 33,
          job: this.localeService.getValue('title_e'),
          location: this.localeService.getValue('local_c'),
          jobLocationId: [2, 3],
        },
        {
          id: 34,
          job: this.localeService.getValue('title_f'),
          location: this.localeService.getValue('local_c'),
          jobLocationId: [2, 3],
        },
        {
          id: 35,
          job: this.localeService.getValue('title_g'),
          location: this.localeService.getValue('local_c'),
          jobLocationId: [2, 3],
        },
        {
          id: 36,
          job: this.localeService.getValue('title_h'),
          location: this.localeService.getValue('local_c'),
          jobLocationId: [2, 3],
        },
        {
          id: 37,
          job: this.localeService.getValue('title_i'),
          location: this.localeService.getValue('local_c'),
          jobLocationId: [2, 3],
        },
        {
          id: 38,
          job: this.localeService.getValue('title_abc'),
          location: this.localeService.getValue('local_c'),
          jobLocationId: [2, 3],
        },
        {
          id: 39,
          job: this.localeService.getValue('title_j'),
          location: this.localeService.getValue('local_c'),
          jobLocationId: [2, 3],
        },
      ],
      total: 10,
    },
  ];

  detailRoute$: BehaviorSubject<any> = new BehaviorSubject(this.mockDetailRoute);

  jobBanner: BehaviorSubject<any> = new BehaviorSubject([
    {
      id: 0,
      name: this.localeService.getValue('job_h'),
      text: this.localeService.getValue('descr_a'),
      imgPath: 'assets/images/about-us/role.svg',
    },
    {
      id: 1,
      name: this.localeService.getValue('job_i'),
      text: this.localeService.getValue('descr_c'),
      imgPath: 'assets/images/about-us/role1.svg',
    },
    {
      id: 2,
      name: this.localeService.getValue('job_c'),
      text: this.localeService.getValue('descr_b'),
      imgPath: 'assets/images/about-us/role2.svg',
    },
    {
      id: 3,
      name: this.localeService.getValue('job_j'),
      text: this.localeService.getValue('descr_d'),
      imgPath: 'assets/images/about-us/role3.svg',
    },
    {
      id: 4,
      name: this.localeService.getValue('job_e'),
      text: this.localeService.getValue('descr_e'),
      imgPath: 'assets/images/about-us/role4.svg',
    },
    {
      id: 5,
      name: this.localeService.getValue('job_f'),
      text: this.localeService.getValue('descr_f'),
      imgPath: 'assets/images/about-us/role5.svg',
    },
    {
      id: 6,
      name: this.localeService.getValue('job_g'),
      text: this.localeService.getValue('descr_g'),
      imgPath: 'assets/images/about-us/role6.svg',
    },
  ]);

  jobsList$: BehaviorSubject<any> = new BehaviorSubject(this.mockJobList);

  jobListRoute: BehaviorSubject<string> = new BehaviorSubject(''); // 订阅职位空缺路由
  applicationRoute: BehaviorSubject<string> = new BehaviorSubject(''); // 订阅申请页面路由
}
