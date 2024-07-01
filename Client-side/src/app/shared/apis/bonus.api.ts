import { Injectable } from '@angular/core';
import moment from 'moment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { BonusActivitCallBackData, GetBonusActivitParam } from '../interfaces/bank-card.interface';
import {
  ActivityDetail,
  ActivityList,
  BackwaterData,
  BackwaterListParams,
  BonusCustomerApply,
  BonusDetail,
  BonusDetailList,
  BonusDetailParams,
  BonusFlowParams,
  BonusGrantListData,
  BonusGrantParam,
  BonusSelect,
  BonusSortParam,
  BonusTypeList,
  ContestActivities,
  CouponCodeExchangeResult,
  CouponCodeParams,
  GrandType,
  GrandTypes,
  GrantTypeSelect,
  IExchangeInfo,
  MyRank,
  NoneActivated,
  NoneInActivatedCards,
  NoneStickyOverview,
  Rank,
  ReceiveBackwaterParams,
  RespActivityDetail,
} from '../interfaces/bonus.interface';
import { ResponseListData } from '../interfaces/response.interface';
import { ResponseData } from './../interfaces/response.interface';
import { BaseApi } from './base.api';
@Injectable({
  providedIn: 'root',
})
export class BonusApi extends BaseApi {
  private get bonusUrl(): string {
    return `${environment.apiUrl}/v1/asset/bonus`;
  }

  private get noneStickyUrl(): string {
    return `${environment.apiUrl}/v1/asset/nonsticky`;
  }

  /**
   * 卡券发放方式，下拉列表
   */
  getGrantTypeSelect(): Observable<ResponseData<GrantTypeSelect[]>> {
    return this.get(`${this.bonusUrl}/getgranttypeselect`);
  }

  /**
   * 红利历史记录
   *
   * @param params
   */
  getBonusGrantList(params: BonusGrantParam): Observable<ResponseListData<BonusGrantListData[]>> {
    return this.get(`${this.bonusUrl}/getbonusgrantlist`, params);
  }

  /**
   *  查询用户能参与的活动
   *
   * @param currency 币种
   * @param level VIP等级
   * @param tenantId 商户id
   * @param uid UID
   * @param amount 金额
   * @param params
   * @returns
   */
  getBonusActivity(params: GetBonusActivitParam): Observable<Array<BonusActivitCallBackData> | null> {
    const url = `${environment.apiUrl}/v1/asset/bonus/getbonusactivity`;
    return this.get<ResponseData<Array<BonusActivitCallBackData>>>(url, params).pipe(map(x => x?.data || null));
  }

  /**
   * payment iq 传活动值
   *
   * @param params
   * @param params.activityNo
   * @returns
   */
  onPiqActivityNo(params: { activityNo: string }): Observable<boolean> {
    const url = `${environment.apiUrl}/v1/asset/bonus/paymentiqdepositbonus`;
    return this.post<ResponseData<boolean>>(url, params).pipe(map(x => x?.data));
  }

  /**
   *  虚拟动值
   *
   * @param params
   * @param params.activityNo
   * @returns
   */
  onCryptoActivityNo(params: { activityNo: string }): Observable<boolean> {
    const url = `${environment.apiUrl}/v1/asset/bonus/cryptodepositbonus`;
    return this.post<ResponseData<boolean>>(url, params).pipe(map(x => x?.data));
  }

  /**
   * 获取卡券状态，下拉列表
   */
  getBonusSelect(): Observable<ResponseData<BonusSelect[]>> {
    return this.get(`${this.bonusUrl}/getbonusselect`);
  }

  /**
   * 获取卡券类型，下拉列表
   *
   * @returns 卡券类型下拉数据
   */
  getBonusTypeList(): Observable<BonusTypeList[]> {
    return this.get<ResponseData<BonusTypeList[]>>(`${this.bonusUrl}/getbonustypelist`).pipe(
      map(x => {
        if (x?.data) {
          const data = x.data;
          let newTypeCode: string;
          const list = data.map((item: BonusTypeList) => {
            if (item.typeCode === null) {
              if (item.grantType === GrandType.Cash) {
                newTypeCode = 'xjj';
              }
              if (item.grantType === GrandType.SVIP) {
                newTypeCode = 'yhq';
              }
            } else {
              newTypeCode = item.typeCode;
            }
            return {
              ...item,
              title: `${item.title} ( ${item.total} )`,
              newTypeCode: newTypeCode,
            };
          });
          return list;
        } else {
          return [];
        }
      })
    );
  }

  /**
   * 获取用户卡券列表
   *
   * @param param
   * @returns
   */
  getBonusDetail(param: BonusDetailParams): Observable<BonusDetail> {
    return this.get<ResponseData<BonusDetail>>(`${this.bonusUrl}/bonusdetail`, param).pipe(
      map(v => {
        if (v?.data) {
          const data = v.data;
          let currency: string;
          let amount: string | number;
          let bottomText: string = '';
          const list = data.list.map((item: BonusDetailList) => {
            if (item.currency === 'Unknown') {
              currency = 'SVIP';
              amount = this.localeService.getValue('svip_coup');
            } else {
              currency = item.currency;
              amount = item.amount;
            }

            switch (item?.grantType) {
              case 'Cash':
                bottomText = `${this.localeService.getValue('wd_limit')} ${
                  item?.withdrawFlowMultiple || 0
                } ${this.localeService.getValue('times')}`;
                break;
              case 'Coupon':
                if (item?.minBetLimit === 0) {
                  bottomText = `${this.localeService.getValue('single_credit')} ${
                    item?.maxBetRate || 0
                  }%, ${this.localeService.getValue('max_de')} ${item?.maxBetAmount || 0} USDT`;
                } else {
                  bottomText = `${this.localeService.getValue('single_credit')} ${
                    item?.maxBetRate || 0
                  }%, ${this.localeService.getValue('max_de')} ${
                    item?.maxBetAmount || 0
                  }USDT, ${this.localeService.getValue('min_bet_limit')} ${item?.minBetLimit || 10} USDT`;
                }
                break;
              default:
                bottomText = '';
                break;
            }

            return {
              ...item,
              currency,
              amount,
              bottomText,
              labels: [
                `${item?.activityType === 'Vip' ? this.localeService.getValue('vip_exclusive') : ''}`,
                ...(item?.labels || []),
                this.grandTypeTrans(item?.grantType || ''),
              ],
            };
          });

          return {
            ...data,
            list,
          };
        } else {
          return {
            list: [],
            total: 0,
          };
        }
      })
    );
  }

  /**
   * 将卡券 类型转为文案
   *
   * @param grandType 卡券类型
   * @returns 文案
   */
  grandTypeTrans(grandType: GrandTypes): string {
    switch (grandType) {
      case 'Cash':
        return this.localeService.getValue('cash_coupons');
      case 'Coupon':
        return this.localeService.getValue('cre_vou');
      case 'SVIP':
        return `SVIP${this.localeService.getValue('svip_coup')}`;
      case 'InKind':
        return this.localeService.getValue('in_kind_coupons');
      case 'Equip':
        return this.localeService.getValue('equipment_coupons');
      case 'FreeSpin':
        return this.localeService.getValue('free_spin_coupons');
      default:
        return this.localeService.getValue('after_cash_coupons');
    }
  }

  /**
   * 领取卡券
   *
   * @param param
   * @returns
   */
  getReceiveBackwater(param: ReceiveBackwaterParams): Observable<ResponseData<any>> {
    this.dataCollectionService.addPoint({ eventId: 30020 });
    return this.get(`${this.bonusUrl}/receivebackwater`, param);
  }

  /**
   * 一键领取卡券
   *
   * @returns boolean
   */
  onBatchReceiveBonus(): Observable<boolean | null> {
    return this.post<ResponseData<boolean>>(`${this.bonusUrl}/batchreceivebonus`).pipe(map(v => v?.data || null));
  }

  /**
   * 抵用金排序
   *
   * @param params
   * @returns
   */
  onOrderCreditBets(params: BonusSortParam[]): Observable<boolean | null> {
    return this.post<ResponseData<boolean>>(`${this.bonusUrl}/bonussort`, { bonusSort: params }).pipe(
      map(v => v?.data || null)
    );
  }

  /**
   * 获取抵用金使用详情
   *
   * @param param
   * @returns
   */
  getBonusFlow(param: BonusFlowParams): Observable<ResponseData<BackwaterData>> {
    return this.get(`${this.bonusUrl}/bonusflow`, param);
  }

  /**
   * 获取反水数据
   *
   * @param param
   * @returns
   */
  getQueryBackwaterList(param: BackwaterListParams): Observable<ResponseData<BackwaterData>> {
    return this.get(`${this.bonusUrl}/querybackwaterlist`, param);
  }

  /**
   * 首页展示: 获取活动列表
   *
   * @param params
   * @param params.equipment
   * @params equipment - Web, H5 , App
   * @returns []
   */
  getActivityInfo(params: { equipment: string }): Observable<ActivityList> {
    const url = `${this.bonusUrl}/getactivityinfo`;
    return this.get(url, params).pipe(
      map((x: any) => {
        if (x?.data) {
          const data = x.data;
          const allLists: RespActivityDetail[] = [];
          data.list.map((item: RespActivityDetail) => {
            allLists.push(...item.list);
          });
          const addAllActivities = {
            labelCode: 'all',
            labelName: this.localeService.getValue('all'),
            list: allLists.sort((a, b) => Number(a?.sort || 0) - Number(b?.sort || 0)),
          };
          return { list: [addAllActivities, ...data.list] };
        }
        return { list: [] };
      })
    );
  }

  /**
   * 活动详情
   *
   * @param params 请求活动详情参数
   * @returns
   */
  getActivityDetail(params: ActivityDetail): Observable<RespActivityDetail | null> {
    const url = `${this.bonusUrl}/getactivitydetail`;
    return this.get(url, params).pipe(
      map((x: any) => {
        if (x?.data) {
          const data = x.data as RespActivityDetail;
          return {
            ...data,
            content: this.localeService.brandNameReplace(data.content ?? ''),
          };
        }
        return null;
      })
    );
  }

  /**
   * 竞赛获取我的排名
   *
   * @param params 活动编号
   * @param params.activitiesNo
   */
  getMyRankById(params: { activitiesNo: string }): Observable<MyRank> {
    const url = `${this.bonusUrl}/getrankbyid`;
    return this.get(url, params).pipe(
      map((x: any) => {
        if (x?.data) {
          const data = x.data;
          let period: string = '';
          const remainingTime = Number(data?.endTime || 0) - Number(data?.nowTime || 0);
          switch (data.period) {
            case 'day':
              period = `24 ${this.localeService.getValue('hour_unit')}`;
              break;
            case 'week':
              period = `7 ${this.localeService.getValue('day')}`;
              break;
            case 'month':
              period = `30 ${this.localeService.getValue('day')}`;
              break;
            case 'year':
              period = `365 ${this.localeService.getValue('day')}`;
              break;
            case 'single':
              period = this.localeService.getValue('single');
              break;
            default:
              break;
          }

          return {
            ...data,
            remainingTime,
            text: `${data.title}${period ? ' - ' + period : ''}`,
          };
        }

        return null;
      })
    );
  }

  /** 获取竞赛活动 名称*/
  getContestTitleList(): Observable<ContestActivities> {
    const url = `${this.bonusUrl}/getcontestactivities`;
    return this.get(url).pipe(
      // map(() => {
      //   return {
      //     success: true,
      //     code: '200',
      //     message: null,
      //     data: {
      //       title: [
      //         {
      //           title: '圣诞周流水大赛',
      //           endTime: 1703462399000,
      //           nowTime: 1703144612000,
      //           activitiesNo: 'B1956872682361413',
      //           executeType: 0,
      //           period: 'week',
      //           bonusImgUrl: null,
      //           gameTypeNumber: 1,
      //           providerCatIds: [
      //             'PinnacleSport',
      //             'SBOSport',
      //             'OBSport',
      //             'FBSport',
      //             'IMSport',
      //             'SaBaSport',
      //             'TFESport',
      //             'IMESport',
      //             'SGLottery',
      //             'TCLottery',
      //             'GBGame',
      //             'GPIGame',
      //             'SaBaSport',
      //             'VRLottery',
      //             'OBLottery',
      //             'AllBet',
      //             'AGLive',
      //             'OG',
      //             'OBLive',
      //             'WELive',
      //             'SALive',
      //             'WMLive',
      //             'MGSlot',
      //             'GPILive',
      //             'Sexy',
      //             'playtech',
      //             'evolution',
      //             'EALive',
      //             'BBINLive',
      //             'N2Live',
      //             'pragmatic',
      //           ],
      //           gameLists: [],
      //           introduction: '',
      //           content:
      //             '活动条件&nbsp;活动对象：全体用户活动时间：2023年12月04日 至 2023年12月31日 (UTC+0)内容简介：用户在体育电竞；真人娱乐场；彩票平台进行投注，每周前100名交易量最高的用户将瓜分6,000 USDT大奖活动内容如何参与1: 该优惠为USDT或等值币种现金券，以用户所选的默认币种进行发放。2. 你在LT.COM的每一笔有效投注，无论是交易体育赛事、娱乐场或彩票，都会让你在每日赛事排行榜上攀升！第1名 ➝ 888 USDT第2名 ➝ 688 USDT第3名 ➝ 388 USDT第4名 ➝ 288 USDT第5名 ➝ 188 USDT第6 - 10名 ➝ 128 USDT第11 - 30-名 ➝ 68 USDT第31 - 50名 ➝ 38 USDT第51 - 70名 ➝&nbsp; 28 USDT第71 - 100名 ➝ 8 USDT3. 现金优惠券将于当周比赛结束后3小时内派发。4. 每周定义：周一 到 周日 （UTC+0）5. 奖励领取路径：进入个人中心 &gt; 卡券中心 领取。6. 随后您可使用现金优惠券进行投注或提款&nbsp;完整条款与规则对于在活动期间从事虚假或非法活动的参与者，LT.COM保留取消其资格和撤销奖励的权利，包括大宗账户注册以获取额外奖金以及与非法、欺诈或有害目的有关的任何其他行为。&nbsp;使用现金优惠券1. 如果您在现金优惠券发放7天后未提取此优惠券，优惠券将失效并被移除；2. 该现金优惠券需完成1倍有效流水即可提款。&nbsp;一般规则1. 该优惠以现金优惠券形式进行发放。2. 此优惠将于2023年12月31日23:59（协调世界时UTC时间）关闭。3. 无论是个人或是组合中的一员，如有任何违反优惠或推广活动条款的行为，或有任何证据表明单独客户或一组客户所进行的一系列投注来源于额外支付、免费投注、无风险投注、投注抵用金或任何其他推广优惠，无论结果如何，只要导致客户获得保证的利润，LT.COM可要求用户进行进阶版身份验证，并可索回此类相关优惠中的额外支付、免费投注、无风险投注或投注抵用金和/或取消任何使用免费投注或投注抵用金进行的投注。此外，若有证据表明存在该行为，LT.COM可向客户收取手续费（手续费的上限等值于投注抵用金、免费投注、无风险投注或额外支付），以弥补检测该行为和对其采取措施而产生的行政管理费用。4. LT.COM可索回错误添加的奖金金额、免费投注、投注抵用金或额外支付。5. 每位客户仅可享受一项本公司所提供的优惠。如果LT.COM有理由怀疑同一个客户、同一组客户不止一次申领奖金或优惠，LT.COM可随时收回任何客户或客户组的任何或全部优惠，并/或取消任何使用奖金或优惠进行的投注和因这些投注而产生的彩金。6. LT.COM可能随时对此优惠进行微改以更正笔误、提高用语清晰度或提升客户体验，并且可能随时因法律或法规要求取消此优惠。7. LT.COM的雇员、办公人员及管理人员﹑相关促销代理﹑授权者和被授权者、服务提供商及其他相关人员或合作机构都不得参加此活动。此规定亦适用于以上人员的直系亲属。',
      //           currency: [],
      //         },
      //         {
      //           title: '圣诞周盈利大赛',
      //           endTime: 1703462399000,
      //           nowTime: 1703144612000,
      //           activitiesNo: 'B1956890151521349',
      //           executeType: 2,
      //           period: 'week',
      //           bonusImgUrl: null,
      //           gameTypeNumber: 1,
      //           providerCatIds: [
      //             'MGSlot',
      //             'FCHunter',
      //             'AGSlot',
      //             'avatarux',
      //             'JDBGame',
      //             'TTGGame',
      //             'playtech',
      //             'popiplay',
      //             'wazdan',
      //             'printstudios',
      //             'thunderkick',
      //             'bet2tech',
      //             'redtiger',
      //             'truelab',
      //             'relax',
      //             'PG',
      //             'GPISlot',
      //             'CQ9Game',
      //             'KMSlot',
      //             'nolimit',
      //             'bgaming',
      //             'slotmill',
      //             'Baison',
      //             'pushgaming',
      //             'igrosoft',
      //             'bigtimegaming',
      //             'skywind',
      //             'spearhead',
      //             'playson',
      //             'belatra',
      //             'zillion',
      //             'fantasma',
      //             'platipus',
      //             'AGLive',
      //             'hacksaw',
      //             'netent',
      //             'PNGGame',
      //             'spribe',
      //             'pragmatic',
      //             'LGDGame',
      //             'quickspin',
      //           ],
      //           gameLists: [],
      //           introduction: '',
      //           content:
      //             '活动条件&nbsp;活动对象：全体用户活动时间：2023年12月04日 至 2023年12月31日 (UTC+0)内容简介：用户在老虎机平台进行投注，每周前50名盈利最高的用户将瓜分1750 USDT大奖活动内容如何参与1: 该优惠为USDT或等值币种现金券，以用户所选的默认币种进行发放。2. 你在LT.COM的每一笔有效投注，无论是交易体育赛事、娱乐场或彩票，都会让你在每日赛事排行榜上攀升！第1名 ➝ 388 USDT第2名 ➝ 288 USDT第3名 ➝ 188 USDT第4 - 5名 ➝ 88 USDT第6 - 10名 ➝ 38 USDT第11 - 30-名 ➝ 18 USDT第31 - 50名 ➝ 8 USDT3. 现金优惠券将于当周比赛结束后3小时内派发。4. 每周定义：周一 到 周日 （UTC+0）5. 奖励领取路径：进入个人中心 &gt; 卡券中心 领取。6. 随后您可使用现金优惠券进行投注或提款&nbsp;完整条款与规则对于在活动期间从事虚假或非法活动的参与者，LT.COM保留取消其资格和撤销奖励的权利，包括大宗账户注册以获取额外奖金以及与非法、欺诈或有害目的有关的任何其他行为。&nbsp;使用现金优惠券1. 如果您在现金优惠券发放7天后未提取此优惠券，优惠券将失效并被移除；2. 该现金优惠券需完成1倍有效流水即可提款。&nbsp;一般规则1. 该优惠以现金优惠券形式进行发放。2. 此优惠将于2023年12月31日23:59（协调世界时UTC时间）关闭。3. 无论是个人或是组合中的一员，如有任何违反优惠或推广活动条款的行为，或有任何证据表明单独客户或一组客户所进行的一系列投注来源于额外支付、免费投注、无风险投注、投注抵用金或任何其他推广优惠，无论结果如何，只要导致客户获得保证的利润，LT.COM可要求用户进行进阶版身份验证，并可索回此类相关优惠中的额外支付、免费投注、无风险投注或投注抵用金和/或取消任何使用免费投注或投注抵用金进行的投注。此外，若有证据表明存在该行为，LT.COM可向客户收取手续费（手续费的上限等值于投注抵用金、免费投注、无风险投注或额外支付），以弥补检测该行为和对其采取措施而产生的行政管理费用。4. LT.COM可索回错误添加的奖金金额、免费投注、投注抵用金或额外支付。5. 每位客户仅可享受一项本公司所提供的优惠。如果LT.COM有理由怀疑同一个客户、同一组客户不止一次申领奖金或优惠，LT.COM可随时收回任何客户或客户组的任何或全部优惠，并/或取消任何使用奖金或优惠进行的投注和因这些投注而产生的彩金。6. LT.COM可能随时对此优惠进行微改以更正笔误、提高用语清晰度或提升客户体验，并且可能随时因法律或法规要求取消此优惠。7. LT.COM的雇员、办公人员及管理人员﹑相关促销代理﹑授权者和被授权者、服务提供商及其他相关人员或合作机构都不得参加此活动。此规定亦适用于以上人员的直系亲属。',
      //           currency: [],
      //         },
      //       ],
      //     },
      //   };
      // }),
      map((x: any) => {
        if (x?.data) {
          const data = x.data as ContestActivities;
          let period: string = '';
          let endTime: string = '';
          const dayStamp = 24 * 60 * 60 * 1000;
          const hourStamp = 60 * 60 * 1000;

          const onEndTime = (item: ContestActivities): number => {
            const timeGap = Number(item.endTime) - Number(item.nowTime);
            const unit: 'days' | 'minutes' | 'hours' =
              timeGap > dayStamp ? 'days' : timeGap > hourStamp ? 'hours' : 'minutes';
            return moment(item.endTime).diff(moment(item.nowTime), unit);
          };

          const onEndTimeUnit = (item: ContestActivities) => {
            const timeGap = Number(item.endTime).minus(item.nowTime);
            const unit = timeGap > dayStamp ? 'after_day' : timeGap > hourStamp ? 'after_hours' : 'after_minutes';
            return this.localeService.getValue(unit);
          };
          const title = data.title
            .map((item: any) => {
              const remainingTime = Number(item?.endTime || 0).minus(item?.nowTime || 0);
              switch (item.period) {
                case 'day':
                  period = `24 ${this.localeService.getValue('hour_unit')}`;
                  endTime = `${onEndTime(item)} ${onEndTimeUnit(item)}`;
                  break;
                case 'week':
                  period = `7 ${this.localeService.getValue('day')}`;
                  endTime = `${onEndTime(item)} ${onEndTimeUnit(item)}`;
                  break;
                case 'month':
                  period = `30 ${this.localeService.getValue('day')}`;
                  endTime = `${onEndTime(item)} ${onEndTimeUnit(item)}`;
                  break;
                case 'year':
                  period = `365 ${this.localeService.getValue('day')}`;
                  endTime = `${onEndTime(item)} ${onEndTimeUnit(item)}`;
                  break;
                case 'single':
                  period = this.localeService.getValue('single');
                  endTime = `${onEndTime(item)} ${onEndTimeUnit(item)}`;
                  break;
                default:
                  break;
              }
              return {
                ...item,
                endTime,
                icon: 'icon-race-clock',
                remainingTime,
                text: `${item.title}${period ? ' - ' + period : ''}`,
              };
            })
            .filter(item => item.title !== 'unknown');
          return {
            ...data,
            title,
          };
        }
        return { title: [] };
      })
    );
  }

  /**
   * 获取竞赛所有排名
   *
   * @param params 参数
   * @param params.activitiesNo
   * @param params.pageIndex
   * @param params.pageSize
   */
  getRank(params: { activitiesNo: string; pageIndex: number; pageSize: number }): Observable<Rank> {
    const url = `${this.bonusUrl}/getrank`;
    return this.get<ResponseData<Rank>>(url, params).pipe(
      map(x => {
        if (x?.data) {
          const data = x.data as Rank;
          if (data.bonusInfo) {
            const bonusInfo = data?.bonusInfo?.map(info => ({
              ...info,
              userName: info?.userName?.length > 0 ? info?.userName : this.localeService.getValue('invisible'),
              rankNumber: Number(info?.rankNumber || 0),
            }));

            return {
              ...data,
              bonusInfo,
            };
          }

          return data;
        }
        return { bonusInfo: [], total: 0, activitiesNo: '' };
      })
    );
  }

  /**
   * 活动报名接口
   *
   * @param params 申请参数
   * @returns
   */
  bonusCustomerApply(params: BonusCustomerApply): Observable<boolean> {
    const url = `${this.bonusUrl}/bonuscustomerapply`;
    return this.post(url, params).pipe(map((x: any) => x?.data || false));
  }

  /** 获取卡劵数量  */
  getBonusCount(): Observable<number> {
    const url = `${this.bonusUrl}/getbonuscount`;
    return this.get(url).pipe(map((x: any) => x?.data || 0));
  }

  /**
   * 券码兑换优惠券
   *
   * @param params 优惠券号
   * @param params.exchangeCode
   * @returns
   */
  setExchangeReceive(params: { exchangeCode: string }): Observable<boolean> {
    const url = `${this.bonusUrl}/exchangereceive`;
    return this.post(url, params).pipe(map((x: any) => x?.data || false));
  }

  /**
   * 优惠券查询记录
   *
   * @param params
   * @param params.pageIndex
   * @param params.pageSize
   * @params 页码
   * @returns
   */
  getExchangeReceiveInfo(params: { pageIndex: number; pageSize: number }): Observable<IExchangeInfo> {
    const url = `${this.bonusUrl}/exchangereceiveinfo`;
    return this.get<ResponseData<IExchangeInfo>>(url, params).pipe(map(x => x?.data || { total: 0, list: [] }));
  }

  /**
   * 激活None Sticky Card
   *
   * @param params
   * @param params.code 卡券id
   * @returns boolean
   */
  onActivateNoneStickyCard(params: { code: string }): Observable<boolean> {
    const url = `${this.noneStickyUrl}/activatewallet`;
    return this.post<ResponseData<boolean>>(url, params).pipe(map(v => v?.data));
  }

  /**
   * 放弃当前 None sticky card
   *
   * @param params
   * @param params.code  卡券id
   * @returns boolean
   */
  onDiscardNoneStickyCard(params: { code: string }): Observable<boolean> {
    const url = `${this.noneStickyUrl}/cancelwallet`;
    return this.post<ResponseData<boolean>>(url, params).pipe(map(v => v?.data));
  }

  /**
   * 提现当前卡券到钱包
   *
   * @param params
   * @param params.code 卡券id
   * @returns boolean
   */
  onWidthdrawNoneStickyCard(params: { code: string }): Observable<boolean> {
    const url = `${this.noneStickyUrl}/withdrawwallet`;
    return this.post<ResponseData<boolean>>(url, params).pipe(map(v => v?.data));
  }

  /**
   * 获取 非粘性卡券总览
   *
   * @returns
   */
  getNoneStickyOverview(): Observable<NoneStickyOverview | null> {
    const url = `${this.noneStickyUrl}/walletoverview`;
    return this.get<ResponseData<NoneStickyOverview>>(url).pipe(map(v => v?.data || null));
  }

  /**
   * 获取已经激活非粘性卡券
   *
   * @returns
   */
  getActivatedNoneSticky(): Observable<NoneActivated | null> {
    const url = `${this.noneStickyUrl}/getactivated`;
    return this.post<ResponseData<NoneActivated>>(url).pipe(map(v => v?.data || null));

    // TODO: 临时数据
    // return of({
    //   success: true,
    //   code: '200',
    //   message: null,
    //   data: {
    //     casinoBonus: {
    //       code: '12K4VLRY1Z9',
    //       category: 'Casino',
    //       currency: 'USDT',
    //       name: 'FreeSpin Mock Data(Active)',
    //       targetBetTurnover: 5,
    //       currentBetTurnover: 0,
    //       betMultiple: 1,
    //       maxBetPerSpin: 1,
    //       targetBetNum: 1,
    //       currentBetNum: 0,
    //       expires: 1701760965935,
    //       typeCode: 'Turntable',
    //       balance: 5,
    //       freeSpinImage:
    //         'https://d16j89jl5zb4v5.cloudfront.net/Games/22/34/31/637895648753968757/zh-cn/discodiamondsweb.png?q=80&format=webp', //mock
    //       gameName: '迪斯科鑽石', //mock
    //       amountOfFreeSpin: 10, //mock
    //       spinValue: 100, //mock,
    //     },
    //     liveCasinoBonus: {
    //       code: '12K4VLRY1Z9',
    //       category: 'LiveCasino',
    //       currency: 'USDT',
    //       name: '非黏性大转盘活动',
    //       targetBetTurnover: 5,
    //       currentBetTurnover: 0,
    //       betMultiple: 1,
    //       maxBetPerSpin: 1,
    //       targetBetNum: 1,
    //       currentBetNum: 0,
    //       expires: 1701760965935,
    //       typeCode: 'Turntable',
    //       balance: 5,
    //     },
    //   },
    // }).pipe(map(v => v?.data || null)) as any;
  }

  /**
   * 卡券文案
   *
   * @param params
   * @param params.code
   * @param params.category
   * @param params.isDeposit
   * @returns
   */
  getNoneStickyDetail(params: {
    code: string;
    isDeposit: boolean;
    category: string;
  }): Observable<{ content: string } | null> {
    const url = `${this.noneStickyUrl}/getdetail`;
    return this.post<ResponseData<{ content: string }>>(url, params).pipe(map(v => v?.data || null));
  }

  getNoneInActivatedCards(): Observable<NoneInActivatedCards | null> {
    const url = `${this.noneStickyUrl}/getlist`;
    return this.post<ResponseData<NoneInActivatedCards>>(url).pipe(map(v => v?.data || null));

    // TODO: 临时数据
    // return of({
    //   success: true,
    //   code: '200',
    //   message: null,
    //   data: {
    //     casinoBonusList: [
    //       {
    //         code: '12K4W3UCEBP',
    //         category: 'LiveCasino',
    //         currency: 'USDT',
    //         name: '非黏性大转盘活动',
    //         amount: 5,
    //         targetBetTurnover: 5,
    //         betMultiple: 1,
    //         isDeposit: false,
    //         minimumDeposit: 0,
    //         durationDaysAfterActivation: 1,
    //         rate: 1,
    //         typeCode: 'Turntable',
    //         tmpCode: null,
    //         countryCheck: false,
    //         isFreeSpin: false, //mock 是否是免费转
    //       },

    //       {
    //         code: 'PH',
    //         category: 'Casino',
    //         currency: 'USDT',
    //         name: 'FreeSpin Mock Data',
    //         amount: 22.5,
    //         targetBetTurnover: 0,
    //         betMultiple: 1,
    //         isDeposit: true,
    //         minimumDeposit: 10,
    //         durationDaysAfterActivation: 1,
    //         rate: 20,
    //         typeCode: 'Turntable', //mock
    //         tmpCode: '1888834278512005',
    //         countryCheck: false,
    //         freeSpinImage:
    //           'https://d16j89jl5zb4v5.cloudfront.net/Games/22/34/31/637895648753968757/zh-cn/discodiamondsweb.png?q=80&format=webp', //mock
    //         gameName: '迪斯科钻石', //mock
    //         maxSpinNum: 10, //mock
    //         isFreeSpin: true, //mock 是否是免费转
    //       },
    //       {
    //         code: 'PH',
    //         category: 'Casino',
    //         currency: 'USDT',
    //         name: 'FreeSpin Mock Data',
    //         amount: 10,
    //         targetBetTurnover: 0,
    //         betMultiple: 1,
    //         isDeposit: false,
    //         minimumDeposit: 10,
    //         durationDaysAfterActivation: 5,
    //         rate: 20,
    //         typeCode: 'Turntable', //mock
    //         tmpCode: '1888834278512005',
    //         countryCheck: false,
    //         freeSpinImage:
    //           'https://d16j89jl5zb4v5.cloudfront.net/Games/22/34/31/637895648753968757/zh-cn/discodiamondsweb.png?q=80&format=webp', //mock
    //         gameName: '迪斯科钻石', //mock
    //         maxSpinNum: 10, //mock
    //         providerCatId: 'LGDGame-5', //mock
    //         gameId: 'alchemist', //mock
    //         isFreeSpin: true, //mock 是否是免费转
    //         currentSpinNum: 5,
    //         balance: 2,
    //       },
    //       {
    //         code: 'PH',
    //         category: 'Casino',
    //         currency: 'USDT',
    //         name: 'FreeSpin Mock Data',
    //         amount: 10,
    //         targetBetTurnover: 0,
    //         betMultiple: 1,
    //         isDeposit: false,
    //         minimumDeposit: 10,
    //         durationDaysAfterActivation: 5,
    //         rate: 20,
    //         typeCode: 'Turntable', //mock
    //         tmpCode: '1888834278512005',
    //         countryCheck: false,
    //         freeSpinImage:
    //           'https://d16j89jl5zb4v5.cloudfront.net/Games/22/34/31/637895648753968757/zh-cn/discodiamondsweb.png?q=80&format=webp', //mock
    //         gameName: '迪斯科钻石', //mock
    //         maxSpinNum: 10, //mock
    //         providerCatId: 'LGDGame-5', //mock
    //         gameId: 'alchemist', //mock
    //         isFreeSpin: false, //mock 是否是免费转
    //       },
    //     ],
    //     liveCasinoBonusList: [
    //       {
    //         code: 'PH',
    //         category: 'LiveCasino',
    //         currency: 'USDT',
    //         name: '未认证状态非黏性充值',
    //         amount: 0,
    //         targetBetTurnover: 0,
    //         betMultiple: 1,
    //         isDeposit: true,
    //         minimumDeposit: 10,
    //         durationDaysAfterActivation: 1,
    //         rate: 20,
    //         typeCode: 'Deposit',
    //         tmpCode: '1950911330668165',
    //         countryCheck: false,
    //       },
    //       {
    //         code: 'PH',
    //         category: 'LiveCasino',
    //         currency: 'USDT',
    //         name: 'FE存款送非黏性奖金',
    //         amount: 0,
    //         targetBetTurnover: 0,
    //         betMultiple: 1,
    //         isDeposit: true,
    //         minimumDeposit: 10,
    //         durationDaysAfterActivation: 1,
    //         rate: 20,
    //         typeCode: 'Deposit',
    //         tmpCode: '1888834278512005',
    //         countryCheck: true,
    //       },
    //     ],
    //   },
    // }).pipe(map(v => v?.data || null)) as any;
  }

  /**
   * 一件领取所有卡券
   *
   * @returns boolean
   */
  onWithdrawalAllCards(): Observable<boolean> {
    const url = `${this.noneStickyUrl}/batchwithdrawwallet`;
    return this.post<ResponseData<boolean>>(url).pipe(map(v => v?.data));
  }

  /**
   * 红利弹窗 兑换码
   *
   * @param params
   * @returns
   */
  getCoupondeposit(params: CouponCodeParams): Observable<ResponseData<CouponCodeExchangeResult>> {
    const url = `${this.bonusUrl}/getcoupondeposit`;
    return this.get(url, params);
  }
}
