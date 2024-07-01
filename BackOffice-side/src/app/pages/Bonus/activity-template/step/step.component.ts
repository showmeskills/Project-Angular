import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { DestroyService } from 'src/app/shared/models/tools.model';
import { takeUntil } from 'rxjs/operators';
import { ActivityStepService } from 'src/app/pages/Bonus/activity-template/step/step.service';
import { ActivityService } from 'src/app/pages/Bonus/bonus.service';
import { ActivityTypeEnum } from 'src/app/shared/interfaces/activity';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgFor, NgIf } from '@angular/common';
import { filter, merge, of } from 'rxjs';

@Component({
  selector: 'app-setting',
  templateUrl: './step.component.html',
  styleUrls: ['./step.component.scss'],
  providers: [DestroyService],
  standalone: true,
  imports: [NgIf, NgFor, AngularSvgIconModule, RouterOutlet, LangPipe],
})
export class StepComponent implements OnInit {
  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private destroy$: DestroyService,
    public settingService: ActivityStepService,
    public activityService: ActivityService
  ) {
    merge(of(null), this.router.events.pipe(filter((event) => event instanceof NavigationEnd)))
      .pipe(takeUntil(destroy$))
      .subscribe(() => {
        setTimeout(() => {
          this.stepIndex = this.steps.findIndex((e) =>
            this.route.firstChild?.snapshot?.url?.[1]?.path?.includes(e.routePath)
          );

          const { allowEdit } = this.route.snapshot.queryParams; // 快照里的params参数
          this.settingService.hasEditFlag = allowEdit === 'true';
          this.allowEdit = allowEdit === 'true' && /\/setting\/\d+\/.*?-view\//.test(this.router.url);

          const activityType = this.route.firstChild?.snapshot.params['activityType'];
          this.activityType = ActivityTypeEnum[activityType] as any;
        }, 100);
      });
  }

  activityType: ActivityTypeEnum;

  steps = [
    {
      name: '基础设置',
      routePath: 'base',
      code: 'luckRoulette.basicSetting',
    },
    {
      name: '活动资格管理',
      routePath: 'qualifications',
      code: 'luckRoulette.quality',
    },
    {
      name: '活动编辑',
      routePath: 'activity',
      code: 'luckRoulette.eventEdit',
    },
  ];

  stepIndex = 0;
  params: any = {};
  allowEdit = false;

  ngOnInit() {}

  onEdit() {
    this.router.navigateByUrl(this.router.url.replace(/\/setting\/(.*?)\/(.*?)-view\//, '/setting/$1/$2/'));
  }

  onBack() {
    this.settingService.backList.next();

    // 子组件内部判断是否有修改，如果有修改，弹出确认框
    if (this.stepIndex === 2) return;

    const type = this.router.url.split(/\/bonus\/activity-manage\/(.*?)\//)?.[1];
    this.router.navigate(['/bonus/activity-manage/', type]);
  }
}
