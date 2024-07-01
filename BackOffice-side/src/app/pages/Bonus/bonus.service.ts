import { Injectable, Pipe, PipeTransform, Type } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { ActivityTypeEnum } from 'src/app/shared/interfaces/activity';
import {
  BaseConfigComponent,
  ConfigViewComponent,
} from 'src/app/pages/Bonus/activity-template/step/base-config/base-config.component';
import {
  QualityComponent,
  QualityViewComponent,
} from 'src/app/pages/Bonus/activity-template/step/quality/quality.component';
import { StepComponent } from 'src/app/pages/Bonus/activity-template/step/step.component';
import { Routes } from '@angular/router';
import { RouteDataType } from 'src/app/shared/interfaces/common.interface';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { PrizeService } from 'src/app/pages/Bonus/prize.service';
import { TournamentBaseConfigComponent } from './activity-template/tournament/step/base-config/base-config.component';
import { TournamentQualityComponent } from './activity-template/tournament/step/quality/quality.component';
import { HistoricalActivityEnum } from 'src/app/shared/interfaces/bonus';

@Injectable({
  providedIn: 'root',
})
export class BonusService {
  activityInfo: BehaviorSubject<any> = new BehaviorSubject<any>({}); // 模板活动详情
  updateList: Subject<void> = new Subject<any>();

  activityLang(id) {
    switch (id) {
      // 新用户50%首存红利
      case HistoricalActivityEnum.NewUserFirstDepositBonus:
        return 'member.activity.activityName.newUser';
      // 联盟计划活动
      case HistoricalActivityEnum.AllianceProgramActivity:
        return 'member.activity.activityName.alliance';
      // 真人百家乐连赢活动
      case HistoricalActivityEnum.LiveBaccaratWinStreakActivity:
        return 'member.activity.activityName.live';
      // 体育返水升级优惠
      case HistoricalActivityEnum.SportsCashbackUpgradePromotion:
        return 'member.activity.activityName.sport';
      // 人人都是SVIP
      case HistoricalActivityEnum.EveryoneIsSVIP:
        return 'member.activity.activityName.svip';
      // VIP福利全新升级;
      case HistoricalActivityEnum.VIPBenefitsUpgrade:
        return 'member.activity.activityName.vip';
      // 新用户体育保险投注
      case HistoricalActivityEnum.NewUserSportsInsuranceBetting:
        return 'member.activity.activityName.insurance';
      // 身份认证活动
      case HistoricalActivityEnum.IdentityVerificationActivity:
        return 'member.activity.activityName.identity';
      // 推荐好友
      case HistoricalActivityEnum.ReferFriend:
        return 'member.activity.activityName.referFriend';
      // 顶级推荐人
      case HistoricalActivityEnum.TopReferences:
        return 'member.activity.activityName.topReferer';
      // 体育8连胜
      case HistoricalActivityEnum.SportsKeepWin:
        return 'member.activity.activityName.sportsWins';
      // Reward活动
      case HistoricalActivityEnum.Reward:
        return 'member.activity.activityName.reward';
      default:
        return 'member.activity.noActive';
    }
  }
}

@Injectable({
  providedIn: 'root',
})
export class ActivityService {
  constructor(private lang: LangService) {
    (async () => {
      const activityList = {
        [ActivityTypeEnum[ActivityTypeEnum.Unknown]]: 'common.unknown', // 未知
        [ActivityTypeEnum[ActivityTypeEnum.Turntable]]: 'member.activity.sencli11.title', // 幸运大转盘
        [ActivityTypeEnum[ActivityTypeEnum.Deposit]]: 'member.activity.sencli2.title', // 存款活动
        [ActivityTypeEnum[ActivityTypeEnum.CouponCodeDeposit]]: 'member.activity.sencli14.title', // 存送券码
        [ActivityTypeEnum[ActivityTypeEnum.NewUser]]: 'member.activity.sencli3.title', // 新人任务
        [ActivityTypeEnum[ActivityTypeEnum.NewRank]]: 'member.activity.sencli12.title', // 新竞赛活动
        [ActivityTypeEnum[ActivityTypeEnum.EWalletDepBonus]]: 'member.activity.sencli13.title', // 存款额外奖励
        [ActivityTypeEnum[ActivityTypeEnum.VipSignIn]]: 'member.activity.sencli15.title', // 登录签到
        [ActivityTypeEnum[ActivityTypeEnum.VipExclusive]]: 'member.activity.sencli16.title', // 专属VIP
      };

      for (let key of Object.keys(activityList)) {
        this.activityLang[key] = (await this.lang.getOne(activityList[key])) || '';
      }
    })();
  }

  activityLang: { [p: string]: string } = {};

  getLangText(type?: any) {
    return this.activityLang[type] || this.activityLang[ActivityTypeEnum[ActivityTypeEnum.Unknown]];
  }
}

@Pipe({
  name: 'prizeConfig',
  pure: false, // 不纯，检测周期中调用
  standalone: true,
})
export class PrizeConfigPipe implements PipeTransform {
  constructor(
    private lang: LangService,
    private prizeService: PrizeService
  ) {}

  value = '-';
  previewValue = '';

  /**
   * 获取奖品配置
   * @param value
   */
  transform(value: any) {
    if (!value) return this.value;
    if (this.previewValue === value) return this.value;
    this.previewValue = value;

    this.prizeService.getPrizeConfigLang().then((getConfigText) => {
      this.value = getConfigText(value);
    });

    return this.value;
  }
}

export const mangeData = { name: '活动管理', lang: 'nav.eventManagement', link: '/bonus/activity-manage' };

/**
 * 生成活动路由 - 一二步、以及查看路由、活动记录路由
 */
export class ActivityRoute {
  /**
   * @param type 活动类型
   * @param ListComponent 活动列表组件
   * @param lang 活动名称翻译key
   */
  constructor(type: ActivityTypeEnum, ListComponent: Type<any>, lang?: string) {
    // 不能做动态路由，需要写死路径，不然面包屑跳转会定位到动态路由，或手动生成面包屑会更加麻烦
    const name = ActivityTypeEnum[type];
    this.prefix = `activity-manage/${name}`;
    this.link = `/bonus/${this.prefix}`;
    this.stepPath = `${this.link}/setting/${type}`;
    this.lang = lang || `member.activity.${name}Title`;
    this._listRoute = [
      { path: this.prefix, redirectTo: this.prefix, pathMatch: 'full' },
      {
        path: this.prefix,
        component: ListComponent,
        data: {
          link: this.link,
          lang: this.lang,
          breadcrumbsBefore: [mangeData],
          showMerchant: true,
        },
      },
    ];

    this.listBreadcrumbs = { link: this.link, lang: this.lang };
    this.breadcrumbsBefore = [mangeData, this.listBreadcrumbs];
    this._stepStepChildren = [
      { path: '', redirectTo: type + '/base', pathMatch: 'full' },
      {
        path: `:activityType/base`,
        component: BaseConfigComponent,
        data: {
          name: '活动资格管理 - 第一步',
          lang: 'member.activity.sencli11.turntableBase',
          breadcrumbsBefore: this.breadcrumbsBefore,
        },
      },
      {
        path: `:activityType/base/:id/:code`,
        component: BaseConfigComponent,
        data: {
          name: '活动资格管理 - 第一步',
          lang: 'luckRoulette.quality',
          breadcrumbsBefore: this.breadcrumbsBefore,
        },
      },
      {
        path: `:activityType/base-view/:id/:code`,
        component: ConfigViewComponent,
        data: {
          name: '基础设置模板 - 第一步查看',
          lang: 'luckRoulette.basicConfigView',
          breadcrumbsBefore: this.breadcrumbsBefore,
          view: true,
        },
      },
      {
        path: `:activityType/qualifications/:id/:code`,
        component: QualityComponent,
        data: {
          name: '活动资格管理 - 第二步',
          lang: 'luckRoulette.eventEdit',
          breadcrumbsBefore: this.breadcrumbsBefore,
        },
      },
      {
        path: `:activityType/qualifications-view/:id/:code`,
        component: QualityViewComponent,
        data: {
          name: '活动资格模块 - 第二步查看',
          lang: 'luckRoulette.qualityView',
          breadcrumbsBefore: this.breadcrumbsBefore,
          view: true,
        },
      },

      /** 新竞赛活动 - 活动步骤路由 */
      {
        path: `:activityType/tournament-base`,
        component: TournamentBaseConfigComponent,
        data: {
          name: '新竞赛活动：基础设置 - 第一步',
          lang: 'member.activity.sencli11.turntableBase',
          breadcrumbsBefore: this.breadcrumbsBefore,
        },
      },
      {
        path: `:activityType/tournament-base/:id/:code`,
        component: TournamentBaseConfigComponent,
        data: {
          name: '新竞赛活动：基础设置 - 第一步',
          lang: 'luckRoulette.quality',
          breadcrumbsBefore: this.breadcrumbsBefore,
        },
      },
      {
        path: `:activityType/tournament-qualifications/:id/:code`,
        component: TournamentQualityComponent,
        data: {
          name: '新竞赛活动：活动资格管理 - 第二步',
          lang: 'luckRoulette.eventEdit',
          breadcrumbsBefore: this.breadcrumbsBefore,
        },
      },
    ];

    this._stepRoute = {
      path: `${this.prefix}/setting`,
      component: StepComponent,
      data: {
        name: '基础设置',
        link: this.link,
        lang: 'member.activity.sencli11.turntableBase',
        showMerchant: true,
      },
      children: this._stepStepChildren,
    };
  }

  prefix = '';
  stepPath = '';
  link = '';
  lang = '';
  listBreadcrumbs: { link: string; lang: string };
  breadcrumbsBefore: { link: string; lang: string }[];

  private _listRoute;
  /**
   * 步骤子路由
   * @private
   */
  private _stepStepChildren: Routes = [];

  /**
   * 步骤路由
   * @private
   */
  private _stepRoute;

  /**
   * 其他的路由
   * @private
   */
  private _otherRoute: Routes = [];

  /**
   * 添加第三步路由
   * @param com {Type<any>} 第三步编辑组件
   * @param comView {Type<any>} 第三步查看组件
   */
  public appendStep3(com: Type<any>, comView: Type<any>) {
    this._stepStepChildren.push(
      ...[
        {
          path: ':activityType/activity/:id/:code',
          component: com,
          data: {
            name: '活动编辑 - 第三步',
            lang: 'luckRoulette.eventEdit',
            breadcrumbsBefore: this.breadcrumbsBefore,
          },
        },
        {
          path: ':activityType/activity-view/:id/:code',
          component: comView,
          data: {
            name: '活动编辑模块 - 第三步查看',
            lang: 'luckRoulette.eventEditTemp',
            breadcrumbsBefore: this.breadcrumbsBefore,
            view: true,
          },
        },
      ]
    );
    return this;
  }

  /**
   * 添加步骤子路由
   * @param route
   */
  appendStepRoute(route: Routes) {
    this._stepStepChildren.push(...route);
  }

  /**
   * 添加路由
   * @param path 路径
   * @param com 组件
   * @param data 路由数据
   */
  appendRoute(path: string, com: Type<any>, data: RouteDataType) {
    this._otherRoute.push({
      path: `${this.prefix}/${path}`,
      component: com,
      data: {
        link: this.link,
        breadcrumbsBefore: this.breadcrumbsBefore,
        ...data,
      },
    });
    return this;
  }

  /**
   * 生成路由
   */
  getRoutes(): Routes {
    this._stepRoute.children = this._stepStepChildren;
    return [...this._listRoute, this._stepRoute, ...this._otherRoute];
  }

  /**
   * 获取后缀参数
   */
  protected getSuffixParams(id?: number | string, activityCode?: string) {
    if (!((!id && !activityCode) || (id && activityCode))) throw new Error('id和activityCode必须同时存在或同时不存在');
    return id ? `/${id}/${activityCode}` : '';
  }

  /**
   * 获取步骤1路径
   */
  getPathStep1(id?: number | string, activityCode?: string) {
    return `${this.stepPath}/base${this.getSuffixParams(id, activityCode)}`;
  }

  /**
   * 获取步骤1查看路径
   */
  getViewPathStep1(id?: number | string, activityCode?: string) {
    return `${this.stepPath}/base-view${this.getSuffixParams(id, activityCode)}`;
  }

  /**
   * 获取步骤2路径
   */
  getPathStep2(id?: number | string, activityCode?: string) {
    return `${this.stepPath}/qualifications${this.getSuffixParams(id, activityCode)}`;
  }

  /**
   * 获取步骤2查看路径
   */
  getViewPathStep2(id?: number | string, activityCode?: string) {
    return `${this.stepPath}/qualifications-view${this.getSuffixParams(id, activityCode)}`;
  }

  /**
   * 获取新竞赛活动步骤1路径
   */
  getPathTournamentStep1(id?: number | string, activityCode?: string) {
    return `${this.stepPath}/tournament-base${this.getSuffixParams(id, activityCode)}`;
  }
}
