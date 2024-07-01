import { Injectable, WritableSignal, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject, Observable, firstValueFrom, of } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { KycApi } from 'src/app/shared/apis/kyc-basic.api';
import { StandardPopupComponent } from 'src/app/shared/components/standard-popup/standard-popup.component';
import {
  AdvancedAuthForEu,
  CurrentPassedKycStatus,
  EuAuthType,
  KycLevelInforItem,
  KycSettingsLimit,
  KycStatus,
  PrimaryKycForm,
  ProcessDetailForEu,
  UserBasicInfor,
  UserVerificationForEu,
} from 'src/app/shared/interfaces/kyc.interface';
import { RequestDocumentDataCallBack } from 'src/app/shared/interfaces/risk-control.interface';
import { cacheValue } from 'src/app/shared/service/general.service';
import { KycDialogService } from 'src/app/shared/service/kyc-dialog.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { PopupService } from 'src/app/shared/service/popup.service';
import { AddSupportDocumentsDialogComponent } from './add-support-documents-dialog/add-support-documents-dialog.component';
import { KycUtils } from './kyc-contants/kyc-utils';

@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class KycService {
  constructor(
    private kycApi: KycApi,
    private localeService: LocaleService,
    private kycUtils: KycUtils,
    private appService: AppService,
    private localStorageService: LocalStorageService,
    private kycDialogService: KycDialogService,
    private popupService: PopupService,
    private dialog: MatDialog,
    private router: Router,
  ) {}

  orderStepSubject: BehaviorSubject<number> = new BehaviorSubject(1); // 认证等级页面  1:基础中国 2:基础非中国 3:中级中国 4:中级非中国
  showMidChinaPage: BehaviorSubject<any> = new BehaviorSubject(true); // 中级验证中国区页面
  dialogStepSubject: BehaviorSubject<number> = new BehaviorSubject(1); // 1:中级验证-账户验证 2:证件信息不符 3:升级审核中 4:基础验证成功 5:手机号说明
  carouselPageSubject: BehaviorSubject<number> = new BehaviorSubject(1); // 当前carousel页码 1:第一页 2:第二页
  bankCardSubject: BehaviorSubject<any> = new BehaviorSubject(null); //选择银行卡类型

  /** 海外 初级 kyc 表单 缓存*/
  foreiPrimaryKycForm = {
    fullName: {
      value: '',
      error: false,
      errorText: '',
    },
    firstName: {
      value: '',
      error: false,
      errorText: '',
    },
    lastName: {
      value: '',
      error: false,
      errorText: '',
    },
    userBorth: {
      value: '',
    },
    email: {
      value: '',
      error: false,
      errorText: '',
      boundEmail: false,
    },
    address: {
      value: '',
    },
    zipCode: {
      value: '',
    },
    city: {
      value: '',
    },
    phone: {
      value: '',
      boundPhone: false,
    },
  };

  /** 中国 初级 kyc 表单 缓存 */
  cnPrimaryKycForm = {
    fullName: {
      value: '',
      error: false,
      errorText: '',
    },
    phone: {
      value: '',
      boundPhone: false,
    },
  };

  /** 用户KYC 当前状态 */
  _kycStatus: WritableSignal<Array<KycStatus>> = signal([]);
  /** 特殊处理 */
  _refreshKycStatusTopbar: WritableSignal<boolean> = signal(false);
  refreshKycStatusTopbar$ = toObservable(this._refreshKycStatusTopbar).pipe(
    filter(() => !this.router.url.includes('kyc')),
  );

  /** 更新驱动 */
  _refreshKycStatus: WritableSignal<string> = signal('');
  refreshKycStatus$ = toObservable(this._refreshKycStatus);

  /** 订阅表单数据 */
  _primaryFormData: WritableSignal<PrimaryKycForm | null> = signal({});
  primaryFormData$ = toObservable(this._primaryFormData);

  /** 缓存当前用户配置 */
  private userKycSettings$?: Observable<Array<KycSettingsLimit>>;

  /** 订阅欧洲 高级kyc */
  advancedAuthForEu$!: Observable<AdvancedAuthForEu>;

  /** 允许欧洲高级kyc */
  isAllowAdvancedEu: boolean = false;

  /** sow 补充材料 */
  isSow: boolean = false;

  /** 提交id */
  sowId: number = 0;

  /**显示kyc安全验证提示横幅 */
  showKycValidationBanner$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    (this.localStorageService.loginToken && this.localStorageService.kycValidationBanner) ?? false,
  );

  /** 需要输入全名的国家全名称国家 中国，香港，台湾，澳门，越南，泰国，马来西亚 */
  get fullNameModeCountryList() {
    return JSON.parse(this.appService.tenantConfig?.config.fullNameCountries || '[]');
  }

  /**
   * 是否开启 欧洲kyc
   *
   * @returns
   */
  get getSwitchEuKyc() {
    return JSON.parse(this.appService.tenantConfig?.config?.switchEuKyc || 'false');
  }

  /** reset 中国 初级KYC表单*/
  onResetKycForm() {
    // 重置 中国 表单
    this.cnPrimaryKycForm.fullName.value = '';
    this.cnPrimaryKycForm.fullName.error = false;
    this.cnPrimaryKycForm.fullName.errorText = '';
    this.cnPrimaryKycForm.phone.value = '';
    this.cnPrimaryKycForm.phone.boundPhone = false;
  }

  /** 重置名 姓 */
  onResetFLName() {
    this.foreiPrimaryKycForm.firstName.value = '';
    this.foreiPrimaryKycForm.firstName.error = false;
    this.foreiPrimaryKycForm.lastName.value = '';
    this.foreiPrimaryKycForm.lastName.error = false;
    this.foreiPrimaryKycForm.phone.value = '';
    this.foreiPrimaryKycForm.address.value = '';
    this.foreiPrimaryKycForm.city.value = '';
    this.foreiPrimaryKycForm.zipCode.value = '';
  }

  /** 重置全名 */
  onResetFullName() {
    this.foreiPrimaryKycForm.fullName.value = '';
    this.foreiPrimaryKycForm.fullName.error = false;
    this.foreiPrimaryKycForm.phone.value = '';
    this.foreiPrimaryKycForm.address.value = '';
    this.foreiPrimaryKycForm.city.value = '';
    this.foreiPrimaryKycForm.zipCode.value = '';
  }

  /**
   * 获取用户 kyc 初中高 title，提款额度配置
   *
   * @returns
   */
  getUserKycSettings() {
    return (
      this.userKycSettings$ ??
      ((this.userKycSettings$ = this.kycApi.getUserKycSettings().pipe(cacheValue(1000 * 60 * 10, v => !!v))),
      this.userKycSettings$)
    );
  }

  async getKycProcessdDetailForEu(level: number): Promise<KycLevelInforItem> {
    const levelInforList: KycLevelInforItem = {};
    const indices = Array.from({ length: level }, (_, i) => i);
    // const indices = Array.from({ length: 3 }, (_, i) => i); // 生成从 0 到 1 的数组,2代表高级kyc，暂时不用获取，因为高级kyc目前没有内容，获取会报错
    await Promise.all(
      indices.map(async index => {
        const apiData = await firstValueFrom(this.kycApi.postProcessdDetailForEu({ kycType: index }));
        if (apiData) {
          levelInforList[index] = apiData;
        }
      }),
    );
    //levelInforList 包含了从 0 到 2 的所有 API 数据
    return levelInforList;
  }

  /**
   * 用户基本信息
   *
   * @returns
   */
  async getMemberBasicInfor(): Promise<UserBasicInfor | null> {
    const apiData = await this.kycApi.getMemberBasicInfo();
    if (apiData?.success && apiData?.data) {
      return apiData?.data;
    } else {
      return null;
    }
  }

  /**
   * 检测kyc状态 最后通过的状态，返回固定内容
   *
   * @param kycStatus kyc原始信息数组
   * @returns
   * level：number ,kyc等级 0 | 1 | 2 | 3
   * kycStatusName：string ,kyc状态名称
   * 其余为当前kyc原本的属性
   */
  checkUserKycStatus(kycStatus: KycStatus[] = []): CurrentPassedKycStatus {
    const levelMap: { [key: string]: number } = {
      KycPrimary: 1,
      KycIntermediat: 2,
      KycAdvanced: 3,
    };

    // 获取最后等级
    const level =
      kycStatus
        .map(v => {
          if (levelMap[v.type] && v.status === 'S') {
            return levelMap[v.type];
          }
          return 0;
        })
        .sort((a, b) => a - b)
        .pop() || 0;

    const currentIndex = level === 0 ? 0 : Number(level - 1);

    return {
      level,
      kycStatusName: [
        this.localeService.getValue('no_cer'),
        this.localeService.getValue('pri_ceri'),
        this.localeService.getValue('inter_ceri'),
        this.localeService.getValue('ad_ceri'),
      ][level],
      ...kycStatus[currentIndex],
    };
  }

  /**
   * 欧洲UI 渲染
   *
   * @param kycStatus kyc状态原始信息数组
   * @param kycUserSetting kyc权限list原始信息数组
   * @param userVerificationForEu
   * @returns
   *
   * kyc限制权限数据列表
   */
  euUIConfig(kycStatus: KycStatus[], kycUserSetting: KycSettingsLimit[], userVerificationForEu: UserVerificationForEu) {
    let primaryStatus = '';
    let intermediateStatus = '';
    let authForEu: 'KycIntermediate' | 'KycAdvanced' | '' = 'KycIntermediate';
    const primaryVerificationStatus = userVerificationForEu?.primaryVerificationStatus || '';
    const idVerificationStatus = userVerificationForEu?.idVerificationStatus || '';
    const poaVerificationStatus = userVerificationForEu?.poaVerificationStatus || '';
    const primary = kycStatus?.find(item => item?.type === 'KycPrimary');
    const intermediate = kycStatus?.find(item => item?.type === 'KycIntermediat');
    const advance = kycStatus?.find(item => item?.type === 'KycAdvanced');
    // 如果是亚洲的 先判断 中级kyc countryCode
    const countryCode = this.getCurKycCountryCode(kycStatus, 'KycIntermediat');
    if (primary) {
      primaryStatus = primary.status;
    }

    if (intermediate) {
      intermediateStatus = intermediate?.status;
      authForEu = 'KycAdvanced';
    }

    return this.onAuthForEu(authForEu).pipe(
      switchMap(result => {
        return of(this.kycUtils.getCardInfoConfig()).pipe(
          map(v => {
            return v.map(item => {
              if (item.id === 0) {
                return {
                  ...item,
                  status: primaryStatus,
                  discrible: kycUserSetting.find(e => e.kycType == 'KycPrimary')?.title || '',
                  acInforConfig: kycUserSetting.find(e => e.kycType == 'KycPrimary')!,
                  cardInfor: item.cardInfor.map((card, index) => {
                    if (index === 0) {
                      return {
                        ...card,
                        status: primaryVerificationStatus,
                      };
                    }
                    return card;
                  }),
                  btnStyle: this.kycSubmitBtnFormat(primaryStatus, 0),
                };
              }

              if (item.id === 1) {
                if (!intermediate && primaryStatus === 'S') {
                  intermediateStatus = 'I';
                }

                return {
                  ...item,
                  status: intermediateStatus,
                  discrible: kycUserSetting.find(e => e.kycType == 'KycIntermediat')?.title || '',
                  acInforConfig: kycUserSetting.find(e => e.kycType == 'KycIntermediat')!,
                  cardInfor: item.cardInfor.map((cardInfo, index) => {
                    if (index === 0) {
                      return {
                        ...cardInfo,
                        status: primaryVerificationStatus,
                      };
                    }

                    if (index === 1) {
                      return {
                        ...cardInfo,
                        status: idVerificationStatus,
                      };
                    }

                    if (index === 2) {
                      return {
                        ...cardInfo,
                        status: poaVerificationStatus,
                      };
                    }
                    return cardInfo;
                  }),
                  btnStyle: this.kycSubmitBtnFormat(intermediateStatus, 1),
                };
              }

              if (item.id === 2) {
                if (!advance) {
                  // 没有提交过 kyc的时候
                  // 非亚洲国家国家
                  if (!this.fullNameModeCountryList.includes(countryCode)) {
                    if (result?.type === 'KycAdvanced') {
                      item.status = 'I';
                      this.isAllowAdvancedEu = true;
                    } else {
                      item.status = '';
                    }
                    item.btnStyle = this.kycSubmitBtnFormat(item.status, 2);
                  } else {
                    // 如果是亚洲 不需要控制 正常开启
                    // 通过中级，开启高级
                    if (intermediateStatus === 'S') {
                      item.status = 'I';
                    } else {
                      // 未通过中级， 高级不开启
                      item.status = '';
                    }
                    item.btnStyle = this.kycSubmitBtnFormat(item.status, 2);
                    this.isAllowAdvancedEu = false;
                  }
                } else {
                  // 提交过kyc的时候
                  item.status = advance?.status;
                  item.btnStyle = this.kycSubmitBtnFormat(item.status, 2);
                  // 非亚洲kyc 被拒绝
                  if (result?.type === 'KycAdvanced' && item?.status === 'R') {
                    this.isAllowAdvancedEu = true;
                  }
                }
                return {
                  ...item,
                  discrible: kycUserSetting.find(e => e.kycType == 'KycAdvanced')?.title || '',
                  acInforConfig: kycUserSetting.find(e => e.kycType === 'KycAdvanced')!,
                  cardInfor: item.cardInfor.map((cardInfo, index) => {
                    if (index === 0) {
                      return {
                        ...cardInfo,
                        value: 'proof_wealth',
                        status: item.status,
                      };
                    }
                    return cardInfo;
                  }),
                };
              }
              return item;
            });
          }),
        );
      }),
    );
  }

  /**
   * 亚洲UI 渲染
   *
   * @param kycStatus
   * @param kycUserSetting
   * @returns
   */
  asiaUIConfig(kycStatus: KycStatus[], kycUserSetting: KycSettingsLimit[]) {
    let primaryStatus = '';
    let intermediateStatus = '';

    const primary = kycStatus?.find(item => item?.type === 'KycPrimary');
    const intermediate = kycStatus?.find(item => item?.type === 'KycIntermediat');
    const advance = kycStatus?.find(item => item?.type === 'KycAdvanced');

    if (primary) {
      primaryStatus = primary.status;
    }

    if (intermediate) {
      intermediateStatus = intermediate?.status;
    }
    if (!intermediate && primaryStatus === 'S') {
      intermediateStatus = 'I';
    }

    return of(this.kycUtils.getCardInfoConfig()).pipe(
      map(v => {
        return v.map(item => {
          if (item.id === 0) {
            return {
              ...item,
              status: primaryStatus,
              discrible: kycUserSetting.find(e => e.kycType == 'KycPrimary')?.title || '',
              acInforConfig: kycUserSetting.find(e => e.kycType === 'KycPrimary')!,
              cardInfor: item.cardInfor.map((card, index) => {
                if (index === 0) {
                  return {
                    ...card,
                  };
                }
                return card;
              }),
              btnStyle: this.kycSubmitBtnFormat(primaryStatus, 0),
            };
          }

          if (item.id === 1) {
            return {
              ...item,
              status: intermediateStatus,
              discrible: kycUserSetting.find(e => e.kycType == 'KycIntermediat')?.title || '',
              acInforConfig: kycUserSetting.find(e => e.kycType == 'KycIntermediat')!,
              cardInfor: item.cardInfor.map((cardInfo, index) => {
                if (index === 0) {
                  return {
                    ...cardInfo,
                  };
                }

                if (index === 1) {
                  return {
                    ...cardInfo,
                  };
                }

                if (index === 2) {
                  return {
                    ...cardInfo,
                  };
                }
                return cardInfo;
              }),
              btnStyle: this.kycSubmitBtnFormat(intermediateStatus, 1),
            };
          }

          if (item.id === 2) {
            if (!advance) {
              // 如果是亚洲 不需要控制 正常开启
              // 通过中级，开启高级
              if (intermediateStatus === 'S') {
                item.status = 'I';
              } else {
                // 未通过中级， 高级不开启
                item.status = '';
              }
              item.btnStyle = this.kycSubmitBtnFormat(item.status, 2);
              this.isAllowAdvancedEu = false;
            } else {
              // 提交过kyc的时候
              item.status = advance?.status;
              item.btnStyle = this.kycSubmitBtnFormat(item.status, 2);
            }
            return {
              ...item,
              discrible: kycUserSetting.find(e => e.kycType == 'KycAdvanced')?.title || '',
              acInforConfig: kycUserSetting.find(e => e.kycType === 'KycAdvanced')!,
              cardInfor: item.cardInfor.map((cardInfo, index) => {
                if (index === 0) {
                  return {
                    ...cardInfo,
                    status: item.status,
                  };
                }
                return cardInfo;
              }),
            };
          }
          return item;
        });
      }),
    );
  }

  /**
   * kyc认证按钮状态数据处理
   *
   * @param status 当前kyc状态
   * @param id kyclist id
   * @returns
   */
  kycSubmitBtnFormat(status: string, id: number) {
    switch (status) {
      case 'I': // intial
        return {
          buttonText: 'start_now',
          btnClass: 'initial-btn',
        };
      case 'P': // pending
        return {
          buttonText: 'refunding',
          btnClass: 'pending-btn',
        };
      case 'S': // pass
        return {
          buttonText: 'cer',
          btnClass: 'pass-btn',
        };
      case 'R': // reject  失败
        return {
          buttonText: 'veri_again',
          btnClass: 'initial-btn',
        };

      case 'U': // 需完成认证
      default:
        if (id === 0) {
          return {
            btnClass: 'invalid-btn',
            buttonText: 'unavailable',
          };
        }
        if (id === 1) {
          return {
            btnClass: 'invalid-btn',
            buttonText: 'unavailable',
          };
        }
        if (id === 2) {
          return {
            btnClass: 'invalid-btn',
            buttonText: 'unavailable',
          };
        }
        throw new Error(`${this.localeService.getValue('unable_proce00')}：${id}`);
    }
  }

  //获取用户待完成的文件信息：后台是否有对该账户发出强制kyc验证请求
  getQueryauthenticateForEu() {
    this.appService.userInfo$
      .pipe(
        untilDestroyed(this),
        switchMap(userInfo => {
          if (userInfo?.isEurope && this.getSwitchEuKyc) {
            return this.kycApi.getUserKycStatus();
          }
          return of(null);
        }),
        switchMap(kycStatus => {
          if (Number(kycStatus?.length || 0) > 1) {
            return this.onAuthForEu('KycIntermediate');
          }
          return of(null);
        }),
      )
      .subscribe(data => {
        if (data?.type === 'KycIntermediate') {
          this.bannerUpdate();
          // 查看运营人员在后台对用户发起中级验证请求
          this.kycDialogService.authenicationIntermediateNoticeDialog();
        }
      });
  }

  /**
   * 更新banner 状态
   *
   * @param show
   */
  bannerUpdate(show: boolean = true) {
    this.showKycValidationBanner$.next(show);
    this.localStorageService.kycValidationBanner = show;
  }

  /**
   * 获取当前对应的 高级kyc 值
   *
   * @param euAuthType
   * @returns
   */
  onAuthForEu(euAuthType: EuAuthType) {
    return this.kycApi.getQueryauthenticateForEu().pipe(map(data => data.find(v => v.type === euAuthType)));
  }

  /**
   * 统一完成验证弹窗
   *
   * @param formatDate
   * @param closeCallback
   */
  successPop(formatDate: string, closeCallback: () => void) {
    this.popupService.open(StandardPopupComponent, {
      speed: 'faster',
      data: {
        type: 'success',
        icon: 'assets/svg/sand-clock-1.svg',
        content: this.localeService.getValue('kyc_in_verification'),
        info: `<div  style="display: flex; justify-content: center;flex-direction: column;gap: 15px;align-items: center">
          ${this.localeService.getValue('kyc_expected_date')}
          <span style="color: #FF580E;">
          ${formatDate}
          </span>
          </div>`,
        buttons: [{ text: this.localeService.getValue('sure_btn'), primary: true }],
        callback: () => {
          closeCallback();
        },
      },
    });
  }

  /**
   * 补充更多资料弹出框
   *
   * @param item
   * @returns
   */
  handleNeedMoreDocuments(item: any): MatDialogRef<AddSupportDocumentsDialogComponent> {
    let panelCss = 'custom-dialog-container';
    if (document.body.offsetWidth <= 799) {
      panelCss = 'kyc-dialog-container'; //----------H5环境进入页面，
    }
    return this.dialog.open(AddSupportDocumentsDialogComponent, {
      panelClass: panelCss,
      autoFocus: false,
      disableClose: true,
      data: {
        item,
      },
    });
  }

  /*
   * 根据kycLevel来进行分类
   * @param requestDocumentsInfor 后台发起补充文件详情信息 KycPrimary, KycIntermediat, KycAdvanced
   */
  formatRequestDocumentsList(requestDocumentsInfor: RequestDocumentDataCallBack) {
    return (
      Object.entries(requestDocumentsInfor || {})
        ?.map(item => {
          if (item[1]) {
            return item[1] || '';
          }
          return null;
        })
        ?.filter(item => item)
        ?.map(item => item?.kycLevel || '') || null
    );
  }

  /**
   * 渲染补充上传的材料
   *
   * @param type
   * @param currentKycDocumentInfor
   * @returns
   */
  doucmentImg(type: string, currentKycDocumentInfor?: ProcessDetailForEu): string[] {
    const idcardProcessLog = currentKycDocumentInfor?.idcardProcessLog || null;
    const poaProcessLog = currentKycDocumentInfor?.poaProcessLog || null;
    switch (type) {
      case 'ID':
        if (idcardProcessLog && idcardProcessLog.originalFileName) {
          return idcardProcessLog.originalFileName.split(';');
        }
        return [];
      case 'POA':
        if (poaProcessLog && poaProcessLog.originalFileName) {
          return poaProcessLog.originalFileName.split(';');
        }
        return [];
      default:
        return [];
    }
  }

  /**
   * 获取当前等级 countryCode
   *
   * @param kycStatus
   * @param type
   * @returns countryCode
   */
  getCurKycCountryCode(kycStatus: KycStatus[], type: 'KycPrimary' | 'KycIntermediat' | 'KycAdvanced'): string {
    return kycStatus?.find(status => status.type === type)?.countryCode || '';
  }

  /**
   * 新 zip code 正则
   *
   * @param v
   * @returns
   */
  zipCodeFormat = (v: string) => {
    return v.replace(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d\s]{10}$/g, '');
  };

  /**
   * 中级验证失败后， 分开 ID和POA 提交
   *
   * @param idFileStatus ID 1 为失败，2为通过 null 为未提交
   * @param poaFileStatus POA 1 为失败 2为通过 null 为未提交
   */
  euMidFailedProcess(idFileStatus: number | null, poaFileStatus: number | null) {
    // 走全流程
    if ((idFileStatus === 1 && poaFileStatus === 1) || (idFileStatus === null && poaFileStatus === null)) {
      this.kycDialogService.openMidVerifyDialog();
    } else if (idFileStatus === 1) {
      //走ID 流程
      this.kycDialogService.openMidVerifyDialog({ status: 'ID', isFailedProcess: true });
    } else if (poaFileStatus === 1) {
      //走POA 流程
      this.kycDialogService.openMidVerifyDialog({ status: 'POA', isFailedProcess: true });
    }
  }
}
