import { Component, DestroyRef, Input, OnInit, computed, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialogRef } from '@angular/material/dialog';
import moment from 'moment';
import { combineLatest, from, of } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { KycApi } from 'src/app/shared/apis/kyc-basic.api';
import { ResourceApi } from 'src/app/shared/apis/resource.api';
import { RiskControlApi } from 'src/app/shared/apis/risk-control.api';
import {
  DetailConfigItem,
  GlobalIntermediate,
  IdEuParams,
  NoticeConfig,
  PoaDetailConfig,
  PoaEuParams,
  UserBasicInfor,
} from 'src/app/shared/interfaces/kyc.interface';
import { ResponseData } from 'src/app/shared/interfaces/response.interface';
import { KycValidationService } from 'src/app/shared/service/kyc-validation';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { KycService } from '../../kyc.service';

@Component({
  selector: 'app-forei-mid-kyc',
  templateUrl: './forei-mid-kyc.component.html',
  styleUrls: ['./forei-mid-kyc.component.scss'],
})
export class ForeiMidKycComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ForeiMidKycComponent>,
    private kycApi: KycApi,
    public appService: AppService,
    public kycService: KycService,
    private toastService: ToastService,
    private localeService: LocaleService,
    private resourceApi: ResourceApi,
    private riskApi: RiskControlApi,
    private toast: ToastService,
    private destroyRef: DestroyRef,
  ) {}
  /**判断是否作来自补充文件流程，默认为false：代表正常kyc中级验证流程，true：代表来自补充文件流程，验证走RiskApi的ID和POA请求*/
  @Input() supplymentaryDocs?: 'ID' | 'POA';
  /** 区分验证 失败后 提交接口 默认为false*/
  @Input() isFailedProcess: boolean | undefined = false;

  poaDetailConfig: PoaDetailConfig = {
    title: this.localeService.getValue('detail_config00'),
    detailList: [
      '•' + this.localeService.getValue('detail_config01'),
      '•' + this.localeService.getValue('detail_config02'),
      '•' + this.localeService.getValue('detail_config03'),
      '•' + this.localeService.getValue('detail_config04'),
      '•' + this.localeService.getValue('detail_config05'),
    ],
  };
  noticeConfig: NoticeConfig = {
    title: this.localeService.getValue('notice_config00') + ':',
    list: [
      '- ' + this.localeService.getValue('notice_config01'),
      '- ' + this.localeService.getValue('notice_config02'),
      '- ' + this.localeService.getValue('notice_config03'),
      '- ' + this.localeService.getValue('notice_config04'),
      '- ' + this.localeService.getValue('notice_config05'),
      '- ' + this.localeService.getValue('notice_config06'),
      '- ' + this.localeService.getValue('notice_config07'),
      '- ' + this.localeService.getValue('notice_config08'),
      '- ' + this.localeService.getValue('notice_config09'),
    ],
  };
  detailConfig: DetailConfigItem[] = [
    {
      icon: 'correct',
      value: this.localeService.getValue(`forei_mid_deta00`),
    },
    {
      icon: 'correct',
      value: this.localeService.getValue(`forei_mid_deta01`),
    },
    {
      icon: 'correct',
      value: this.localeService.getValue(`forei_mid_deta02`),
    },
    {
      icon: 'correct',
      value: this.localeService.getValue(`forei_mid_deta03`),
    },
    {
      icon: 'fail',
      value: this.localeService.getValue(`forei_mid_deta04`),
    },
    {
      icon: 'fail',
      value: this.localeService.getValue(`forei_mid_deta05`),
    },
  ];

  dropDowntype: string = 'dialog';
  /**打开下拉选单 */
  isOpen: boolean = false;

  /**0:身份证件 1:护照 2:驾照 */
  certType: 'ID_CARD' | 'PASSPORT' | 'DRIVING_LICENSE' = 'ID_CARD';

  /**初始页面：验证类型选择 */
  isPage1: boolean = true;
  /**是否允许身份证验证 */
  idcardAllowed: boolean = false;
  /**是否允许驾照验证 */
  driverLicenseAllowed: boolean = false;
  /**是否允许护照验证 */
  passportAllowed: boolean = false;
  /**国家代码 */
  countryCode: string = '';
  /**加载*/
  submitLoading: boolean = false;
  /**证件前照文件名 */
  frontName: string | null = null;
  /**证件后照文件名 */
  backName: string | null = null;

  /**地址 */
  address: string = '';
  /**邮编 */
  zipCode: string = '';
  /**城市 */
  city: string = '';
  /**姓名*/
  fullName: string = '';
  /** 姓 */
  firstName: string = '';
  /** 名 */
  lastName: string = '';
  /** 姓 是否 通过 */
  firstNameValid: boolean = false;
  /** 名 是否通过 */
  lastNameValid: boolean = false;
  showNotice: boolean = false;

  /**kyc初级验证信息 */
  basicUserKycInfo: UserBasicInfor | null = null;

  /**步骤 欧洲
   * 1:ID；
   * 2:ID upload Img
   * 3:Poa page1 upload Img
   * 4:Poa page2 地址信息
   * */
  euPageStep: number = 1;
  /**步骤 欧洲
   * 1:ID；
   * 2:ID upload Img
   * */
  aisaPageStep: number = 1;

  /** 信息loading */
  basicUserKycInfoLoading: boolean = false;

  /** 文件上传 */
  uploadData = signal({
    ID_CARD: {
      frontImage: {
        loading: false,
        upload: {
          type: '',
          imgFileUrl: '',
          poaImgName: '',
        },
        valid: false,
      },
      backImage: {
        loading: false,
        valid: false,
        upload: {
          type: '',
          imgFileUrl: '',
          poaImgName: '',
        },
      },
    },
    PASSPORT: {
      loading: false,
      upload: {
        type: '',
        imgFileUrl: '',
        poaImgName: '',
      },
      valid: false,
    },
    DRIVING_LICENSE: {
      loading: false,
      upload: {
        type: '',
        imgFileUrl: '',
        poaImgName: '',
      },
      valid: false,
    },
    POA: {
      loading: false,
      upload: {
        type: '',
        imgFileUrl: '',
        poaImgName: '',
      },
      valid: false,
    },
  });
  renderUploadData = computed(() => this.uploadData());
  /** 导航diabale */
  renderNavDisable = computed(() => {
    if (this.uploadData().ID_CARD.frontImage.loading) return true;
    if (this.uploadData().ID_CARD.backImage.loading) return true;
    if (this.uploadData().PASSPORT.loading) return true;
    if (this.uploadData().DRIVING_LICENSE.loading) return true;
    if (this.uploadData().POA.loading) return true;
    return false;
  });

  /** 区分欧洲和亚洲 */
  isEurope: boolean = false;

  /** 流程 默认 true */
  isFullEuProcess: boolean = false;

  /** ID 流程 */
  isIDProcess: boolean = false;
  euIDPageStep: number = 1;

  /** 地址流程 */
  poaProcess: boolean = false;
  poaPageStep: number = 1;

  ngOnInit() {
    combineLatest([
      this.appService.currentCountry$.pipe(filter(v => !!v)),
      this.appService.userInfo$.pipe(filter(v => !!v)),
    ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([country, useInfo]) => {
        if (country && useInfo) {
          this.isEurope = useInfo.isEurope;
          this.getUserDetails(country.iso, this.isEurope);
        }
      });

    if (this.supplymentaryDocs === 'POA') {
      this.poaProcess = true;
    } else if (this.supplymentaryDocs === 'ID') {
      this.isIDProcess = true;
    } else {
      this.isFullEuProcess = true;
    }
  }

  /**
   * 获取用户地址信息
   *
   * @param countryISO
   * @param isEurope
   */
  getUserDetails(countryISO: string, isEurope: boolean) {
    if (this.basicUserKycInfo) return;

    this.basicUserKycInfoLoading = true;
    combineLatest([from(this.kycService.getMemberBasicInfor()), this.kycApi.verifyCountry(countryISO)]).subscribe(
      ([userBasicInfo, result]) => {
        const countryDetails = result?.data;
        if (countryDetails) {
          this.countryCode = countryDetails?.countryCode || '';
          this.idcardAllowed = countryDetails?.idcardAllowed;
          this.driverLicenseAllowed = countryDetails?.driverLicenseAllowed;
          this.passportAllowed = countryDetails?.passportAllowed;
        }

        if (userBasicInfo) {
          this.basicUserKycInfo = userBasicInfo;
          if (!isEurope) {
            //亚洲自动带入fullname
            this.fullName = userBasicInfo?.fullName || '';
          } else {
            //欧洲自动带入firstName lastName
            this.firstName = userBasicInfo?.firstName || '';
            this.lastName = userBasicInfo?.lastName || '';
          }
          this.city = userBasicInfo?.city || '';
          this.address = userBasicInfo?.address || '';
          this.zipCode = userBasicInfo?.zipCode || '';
        }

        this.basicUserKycInfoLoading = false;
      },
    );
  }

  /**
   * 关闭弹窗
   */
  close(): void {
    this.dialogRef.close();
  }

  /**
   * 选择国家下拉选框
   */
  onOpenDropDown() {
    this.isOpen = !this.isOpen;
  }

  //切换证件类型
  onCertChanged(type: 'ID_CARD' | 'PASSPORT' | 'DRIVING_LICENSE') {
    this.certType = type;
    this.onResetUpdata();
  }

  /** 重置上传 参数 */
  onResetUpdata() {
    this.uploadData.set({
      ID_CARD: {
        frontImage: {
          loading: false,
          upload: {
            type: '',
            imgFileUrl: '',
            poaImgName: '',
          },
          valid: false,
        },
        backImage: {
          loading: false,
          valid: false,
          upload: {
            type: '',
            imgFileUrl: '',
            poaImgName: '',
          },
        },
      },
      PASSPORT: {
        loading: false,
        upload: {
          type: '',
          imgFileUrl: '',
          poaImgName: '',
        },
        valid: false,
      },
      DRIVING_LICENSE: {
        loading: false,
        upload: {
          type: '',
          imgFileUrl: '',
          poaImgName: '',
        },
        valid: false,
      },
      POA: {
        loading: false,
        upload: {
          type: '',
          imgFileUrl: '',
          poaImgName: '',
        },
        valid: false,
      },
    });
  }

  //返回上一步
  back() {
    if (this.isEurope && this.kycService.getSwitchEuKyc) {
      if (this.isFullEuProcess) {
        this.euPageStep -= 1;
        if (this.euPageStep === 1) {
          this.euPageStep = 1;
          this.onResetUpdata();
        }
      } else if (this.isIDProcess) {
        this.euIDPageStep -= 1;
        if (this.euIDPageStep === 1) {
          this.euIDPageStep = 1;
          this.onResetUpdata();
        }
      } else if (this.poaProcess) {
        this.poaPageStep -= 1;
        if (this.poaPageStep === 1) {
          this.poaPageStep = 1;
          this.onResetUpdata();
        }
      }
    } else {
      this.aisaPageStep -= 1;
      if (this.aisaPageStep === 1) {
        this.aisaPageStep = 1;
        this.onResetUpdata();
      }
    }
  }

  //继续按钮
  handleNext() {
    if (this.isEurope && this.kycService.getSwitchEuKyc) {
      // 欧洲全 流程
      if (this.isFullEuProcess) {
        this.euPageStep += 1;
        if (this.euPageStep === 5) {
          this.euPageStep = 4;
          switch (this.certType) {
            case 'ID_CARD':
              this.postEuKyc(
                `${this.uploadData().ID_CARD.frontImage.upload.poaImgName};${
                  this.uploadData().ID_CARD.backImage.upload.poaImgName
                }`,
                'ID_CARD',
                this.uploadData().ID_CARD.frontImage.upload.imgFileUrl,
                this.uploadData().ID_CARD.backImage.upload.imgFileUrl,
              );
              return;
            case 'PASSPORT':
              this.postEuKyc(
                this.uploadData().PASSPORT.upload.poaImgName,
                'PASSPORT',
                this.uploadData().PASSPORT.upload.imgFileUrl,
              );
              return;
            case 'DRIVING_LICENSE':
              this.postEuKyc(
                this.uploadData().DRIVING_LICENSE.upload.poaImgName,
                'DRIVING_LICENSE',
                this.uploadData().DRIVING_LICENSE.upload.imgFileUrl,
              );
              return;
            default:
              return;
          }
        }
      } else if (this.isIDProcess) {
        // ID 流程
        this.euIDPageStep += 1;
        if (this.euIDPageStep === 3) {
          this.euIDPageStep = 2;
          if (this.isFailedProcess) {
            // 失败ID 流程
            switch (this.certType) {
              case 'ID_CARD':
                this.onEuSubmitId(
                  `${this.uploadData().ID_CARD.frontImage.upload.poaImgName};${
                    this.uploadData().ID_CARD.backImage.upload.poaImgName
                  }`,
                  'ID_CARD',
                  this.uploadData().ID_CARD.frontImage.upload.imgFileUrl,
                  this.uploadData().ID_CARD.backImage.upload.imgFileUrl,
                );
                return;
              case 'PASSPORT':
                this.onEuSubmitId(
                  this.uploadData().PASSPORT.upload.poaImgName,
                  'PASSPORT',
                  this.uploadData().PASSPORT.upload.imgFileUrl,
                );
                return;
              case 'DRIVING_LICENSE':
                this.onEuSubmitId(
                  this.uploadData().DRIVING_LICENSE.upload.poaImgName,
                  'DRIVING_LICENSE',
                  this.uploadData().DRIVING_LICENSE.upload.imgFileUrl,
                );
                return;
              default:
                return;
            }
          } else {
            // 补充材料流程
            switch (this.certType) {
              case 'ID_CARD':
                this.postAddDocument(
                  'ID',
                  'ID_CARD',
                  this.uploadData().ID_CARD.frontImage.upload.imgFileUrl,
                  this.uploadData().ID_CARD.backImage.upload.imgFileUrl,
                );
                return;
              case 'PASSPORT':
                this.postAddDocument('ID', 'PASSPORT', this.uploadData().PASSPORT.upload.imgFileUrl);
                return;
              case 'DRIVING_LICENSE':
                this.postAddDocument('ID', 'DRIVING_LICENSE', this.uploadData().DRIVING_LICENSE.upload.imgFileUrl);
                return;
              default:
                return;
            }
          }
        }
      } else if (this.poaProcess) {
        // 地址流程
        this.poaPageStep += 1;
        if (this.poaPageStep === 3) {
          this.poaPageStep = 2;
          if (this.isFailedProcess) {
            // 验证失败
            this.onEuSubmitPoa();
          } else {
            // 补充材料
            this.postAddDocument('POA', '', '');
          }
        }
      }
    } else {
      // 亚洲判断
      this.aisaPageStep += 1;
      if (this.aisaPageStep === 3) {
        this.aisaPageStep = 2;
        switch (this.certType) {
          case 'ID_CARD':
            this.postKycMid(
              'ID_CARD',
              this.uploadData().ID_CARD.frontImage.upload.imgFileUrl,
              this.uploadData().ID_CARD.backImage.upload.imgFileUrl,
            );
            return;
          case 'PASSPORT':
            this.postKycMid('PASSPORT', this.uploadData().PASSPORT.upload.imgFileUrl);
            return;
          case 'DRIVING_LICENSE':
            this.postKycMid('DRIVING_LICENSE', this.uploadData().DRIVING_LICENSE.upload.imgFileUrl);
            return;
          default:
            return;
        }
      }
    }
  }

  /**
   *
   * @returns
   */
  canSubmit() {
    if (this.isEurope && this.kycService.getSwitchEuKyc) {
      // 欧洲 全流程
      if (this.isFullEuProcess) {
        switch (this.euPageStep) {
          case 1:
            return this.firstName?.length > 0 && this.lastName?.length > 0;
          case 2:
            if (this.certType === 'ID_CARD') {
              return this.uploadData().ID_CARD.frontImage.valid && this.uploadData().ID_CARD.backImage.valid;
            } else if (this.certType === 'PASSPORT') {
              return this.uploadData().PASSPORT.valid;
            } else if (this.certType === 'DRIVING_LICENSE') {
              return this.uploadData().DRIVING_LICENSE.valid;
            } else {
              return false;
            }
          case 3:
            return this.address.length > 0 && this.city.length > 0 && this.zipCode.length > 0;
          case 4:
            return this.uploadData().POA.valid;
          default:
            return false;
        }
      } else if (this.isIDProcess) {
        // 上传ID流程
        switch (this.euIDPageStep) {
          case 1:
            return this.firstName?.length > 0 && this.lastName?.length > 0;
          case 2:
            if (this.certType === 'ID_CARD') {
              return this.uploadData().ID_CARD.frontImage.valid && this.uploadData().ID_CARD.backImage.valid;
            } else if (this.certType === 'PASSPORT') {
              return this.uploadData().PASSPORT.valid;
            } else if (this.certType === 'DRIVING_LICENSE') {
              return this.uploadData().DRIVING_LICENSE.valid;
            } else {
              return false;
            }
          default:
            return false;
        }
      } else if (this.poaProcess) {
        // 上传poa 流程
        switch (this.poaPageStep) {
          case 1:
            return this.address.length > 0 && this.city.length > 0 && this.zipCode.length > 0;
          case 2:
            return this.uploadData().POA.valid;
          default:
            return false;
        }
      } else {
        return false;
      }
    } else {
      // 亚洲
      switch (this.aisaPageStep) {
        case 1:
          return this.fullName?.length > 0 || (this.firstName?.length > 0 && this.lastName?.length > 0);
        case 2:
          if (this.certType === 'ID_CARD') {
            return this.uploadData().ID_CARD.frontImage.valid && this.uploadData().ID_CARD.backImage.valid;
          } else if (this.certType === 'PASSPORT') {
            return this.uploadData().PASSPORT.valid;
          } else if (this.certType === 'DRIVING_LICENSE') {
            return this.uploadData().DRIVING_LICENSE.valid;
          } else {
            return false;
          }
        default:
          return false;
      }
    }
  }

  /**
   * ID和POA验证同时处理; 全部失败可以执行这个
   *
   * @param poaImgName
   * @param frontImagelUrl
   * @param backImageUrl   身份证类型需要
   * @param idType         ID验证类型 ：身份证 - ID_CARD ；护照 - PASSPORT ； 驾照 - DRIVING_LICENSE
   */
  postEuKyc(
    poaImgName: string,
    idType: 'ID_CARD' | 'PASSPORT' | 'DRIVING_LICENSE',
    frontImagelUrl: string,
    backImageUrl: string = '',
  ) {
    this.submitLoading = true;
    const idParams: IdEuParams = {
      firstName: this.basicUserKycInfo?.firstName || '',
      lastName: this.basicUserKycInfo?.lastName || '',
      address: this.basicUserKycInfo?.address || '',
      frontsideImage: frontImagelUrl,
      backsideImage: backImageUrl,
      country: this.countryCode,
      idType: idType,
      dob: moment(this.basicUserKycInfo?.birthday || 0).format('YYYY-MM-DD'),
      originalFileName: poaImgName,
    };
    const poaParams: PoaEuParams = {
      address: this.address,
      city: this.city,
      postalCode: this.zipCode,
      clientKey: '1',
      country: this.countryCode,
      uid: this.basicUserKycInfo?.entityId || '',
      networkImgeUrl: this.uploadData().POA.upload.imgFileUrl,
      originalFileName: this.uploadData().POA.upload.poaImgName,
    };
    /**单独验证ID或者POA */
    combineLatest([
      this.kycApi.postInterMediatedCardForEu(idParams),
      this.kycApi.postInterMediatedPoaForEu(poaParams),
    ]).subscribe(([id, poa]) => {
      if (id?.data || poa?.data) {
        this.kycService._refreshKycStatus.set('fori-mid-kyc-ID-POA');
        this.successPop();
      } else {
        if (!id?.data) {
          this.toastService.show({
            message: id?.message || this.localeService.getValue('kyc_id_veri_fail'),
            type: 'fail',
            title: '',
          });
          this.close();
          this.submitLoading = false;
        } else {
          this.toastService.show({
            message: poa?.message || this.localeService.getValue('kyc_poa_veri_fail'),
            type: 'fail',
            title: '',
          });
          this.close();
          this.submitLoading = false;
        }
      }
    });
  }

  /**
   * 失败后验证 ID
   *
   * @param poaImgName
   * @param idType
   * @param frontImagelUrl
   * @param backImageUrl
   */
  onEuSubmitId(
    poaImgName: string,
    idType: 'ID_CARD' | 'PASSPORT' | 'DRIVING_LICENSE',
    frontImagelUrl: string,
    backImageUrl: string = '',
  ) {
    this.submitLoading = true;
    const idParams: IdEuParams = {
      firstName: this.basicUserKycInfo?.firstName || '',
      lastName: this.basicUserKycInfo?.lastName || '',
      address: this.basicUserKycInfo?.address || '',
      frontsideImage: frontImagelUrl,
      backsideImage: backImageUrl,
      country: this.countryCode,
      idType: idType,
      dob: moment(this.basicUserKycInfo?.birthday || 0).format('YYYY-MM-DD'),
      originalFileName: poaImgName,
    };
    this.kycApi.postInterMediatedCardForEu(idParams).subscribe(id => {
      if (id?.data) {
        this.kycService._refreshKycStatus.set('fori-mid-kyc-fail-ID');
        this.successPop();
      } else {
        this.toastService.show({
          message: id?.message || this.localeService.getValue('kyc_id_veri_fail'),
          type: 'fail',
          title: '',
        });
        this.close();
        this.submitLoading = false;
      }
    });
  }

  /** 失败后验证 POA */
  onEuSubmitPoa() {
    this.submitLoading = true;
    const poaParams: PoaEuParams = {
      address: this.address,
      city: this.city,
      postalCode: this.zipCode,
      clientKey: '1',
      country: this.countryCode,
      uid: this.basicUserKycInfo?.entityId || '',
      networkImgeUrl: this.uploadData().POA.upload.imgFileUrl,
      originalFileName: this.uploadData().POA.upload.poaImgName,
    };
    this.kycApi.postInterMediatedPoaForEu(poaParams).subscribe(poa => {
      if (poa?.data) {
        this.kycService._refreshKycStatus.set('fori-mid-kyc-fail-poa');
        this.successPop();
      } else {
        this.toastService.show({
          message: poa?.message || this.localeService.getValue('kyc_poa_veri_fail'),
          type: 'fail',
          title: '',
        });
        this.close();
        this.submitLoading = false;
      }
    });
  }

  /**
   * 亚洲中级kyc（非中国，香港，台湾，澳门，越南，泰国，马来西亚）
   * 只有ID验证
   *
   * @param frontImagelUrl
   * @param backImageUrl
   * @param idType
   */
  postKycMid(idType: 'ID_CARD' | 'PASSPORT' | 'DRIVING_LICENSE', frontImagelUrl: string, backImageUrl: string = '') {
    this.submitLoading = true;
    const params: GlobalIntermediate = {
      countryCode: this.countryCode,
      idType: idType,
      frontsideImage: frontImagelUrl,
      backsideImage: backImageUrl,
      fullName: this.fullName,
      firstName: this.firstName,
      lastName: this.lastName,
    };

    this.kycApi.globalintermediate(params).subscribe(data => {
      if (data?.data) {
        this.kycService._refreshKycStatus.set('asia-mid-kyc-ID');
        this.successPop();
      } else {
        this.submitLoading = false;
        this.toastService.show({ message: data?.message || '', type: 'fail', title: '' });
        this.close();
      }
      this.submitLoading = false;
    });
  }

  successPop() {
    // 刷新banner
    this.kycService.bannerUpdate(false);

    //账户验证完成弹出框 升级审核中,成功通过submit，使用当前时间
    const currentTime = moment().format('YYYY-MM-DD');
    const formatDate = moment.utc(currentTime).format('YYYY-MM-DD [UTC]');
    this.kycService.successPop(formatDate, () => {
      this.close();
    });
    this.submitLoading = false;
  }

  userNameValid: boolean = false;
  /**
   * 用户名字输入框验证
   *
   * @param event
   */
  onUserNameInput(event: string) {
    this.fullName = event;
    this.userNameValid = this.fullName?.length >= 2;
  }

  /**
   * 检查 名和姓 不可包含特殊字符，空格和数字 (new kyc:用户first/last name自动带入初级验证信息，且用户不能修改)
   * new kyc 该功能不在使用！！
   *
   * @param isFirstName
   * @param name
   */
  onFirstNameAndLastNameInput(isFirstName: boolean, name: string) {
    if (isFirstName) {
      this.firstNameValid = KycValidationService._hasValidFLName(this.countryCode, name);
    }

    if (!isFirstName) {
      this.lastNameValid = KycValidationService._hasValidFLName(this.countryCode, name);
    }
  }

  openNotice() {
    this.showNotice = !this.showNotice;
  }

  /**
   * 上传文件
   *
   * @param target
   * @param key
   * @param type
   * @returns
   */
  selectFile(
    target: HTMLInputElement,
    key: 'ID_CARD' | 'PASSPORT' | 'DRIVING_LICENSE' | 'POA',
    type: 'backImage' | 'frontImage' | string = '',
  ) {
    const file = target.files && target.files[0];
    if (!file) return;

    // 文件类型验证
    const fileType = file.type.toLowerCase();
    if (!['image/png', 'image/jpg', 'image/jpeg', 'application/pdf'].includes(fileType)) {
      this.toast.show({ message: this.localeService.getValue('unsupp_file'), type: 'fail', title: '' });
      target.value = '';
      return;
    }

    // 文件大小验证 10M
    const fileMaxSize = 1024 * 1024 * 10;
    if (file.size > fileMaxSize) {
      this.toast.show({ message: this.localeService.getValue('file_limerr'), type: 'fail', title: '' });
      target.value = '';
      return;
    }

    if (type === 'backImage') {
      this.uploadData.set({
        ...this.uploadData(),
        ID_CARD: {
          ...this.uploadData().ID_CARD,
          backImage: {
            ...this.uploadData().ID_CARD.backImage,
            loading: true,
          },
        },
      });
    } else if (type === 'frontImage') {
      this.uploadData.set({
        ...this.uploadData(),
        ID_CARD: {
          ...this.uploadData().ID_CARD,
          frontImage: {
            ...this.uploadData().ID_CARD.frontImage,
            loading: true,
          },
        },
      });
    } else {
      this.uploadData.set({
        ...this.uploadData(),
        [key]: {
          ...[key],
          loading: true,
        },
      });
    }

    this.resourceApi.uploadFile(file, fileType, 'Kyc').subscribe(url => {
      if (url) {
        this.toast.show({ message: this.localeService.getValue('up_img_s'), type: 'success', title: '' });
        target.value = '';
        if (type === 'backImage') {
          this.uploadData.set({
            ...this.uploadData(),
            ID_CARD: {
              ...this.uploadData().ID_CARD,
              backImage: {
                loading: false,
                valid: true,
                upload: {
                  imgFileUrl: url,
                  type: file.type,
                  poaImgName: file.name,
                },
              },
            },
          });
        } else if (type === 'frontImage') {
          this.uploadData.set({
            ...this.uploadData(),
            ID_CARD: {
              ...this.uploadData().ID_CARD,
              frontImage: {
                loading: false,
                valid: true,
                upload: {
                  imgFileUrl: url,
                  type: file.type,
                  poaImgName: file.name,
                },
              },
            },
          });
        } else {
          this.uploadData.set({
            ...this.uploadData(),
            [key]: {
              ...[key],
              loading: false,
              upload: {
                imgFileUrl: url,
                type: file.type,
                poaImgName: file.name,
              },
              valid: true,
            },
          });
        }
      } else {
        target.value = '';
        if (type === 'backImage') {
          this.uploadData.set({
            ...this.uploadData(),
            ID_CARD: {
              ...this.uploadData().ID_CARD,
              backImage: {
                loading: false,
                valid: false,
                upload: {
                  type: '',
                  imgFileUrl: '',
                  poaImgName: '',
                },
              },
            },
          });
        } else if (type === 'frontImage') {
          this.uploadData.set({
            ...this.uploadData(),
            ID_CARD: {
              ...this.uploadData().ID_CARD,
              frontImage: {
                loading: false,
                valid: false,
                upload: {
                  type: '',
                  imgFileUrl: '',
                  poaImgName: '',
                },
              },
            },
          });
        } else {
          this.uploadData.set({
            ...this.uploadData(),
            [key]: {
              ...[key],
              loading: false,
            },
          });
        }
        this.toast.show({ message: this.localeService.getValue('up_img_f'), type: 'fail', title: '' });
      }
    });
  }

  /**
   *
   * @param submiType
   * @param frontImagelUrl
   * @param backImageUrl
   * @param idType
   */
  postAddDocument(
    submiType: 'POA' | 'ID',
    idType: 'ID_CARD' | 'PASSPORT' | 'DRIVING_LICENSE' | '',
    frontImagelUrl: string,
    backImageUrl: string = '',
  ) {
    switch (submiType) {
      case 'ID':
        this.submitLoading = true;
        this.riskApi
          .getRequestDocument()
          .pipe(
            switchMap(data => {
              if (data) {
                return this.riskApi.postUploadIdVerification({
                  country: this.countryCode,
                  id: data?.idVerification?.id || '',
                  idType: idType,
                  frontImage: frontImagelUrl,
                  backImage: backImageUrl,
                  originalBackImageName: this.uploadData().ID_CARD.backImage.upload.poaImgName,
                  originalFrontImageName: this.uploadData().ID_CARD.frontImage.upload.poaImgName,
                });
              }
              return of(null);
            }),
          )
          .subscribe((resp: ResponseData<boolean> | null) => {
            if (resp?.data) {
              this.kycService._refreshKycStatus.set('fori-mid-kyc-ID-Supplyment');
              this.successPop();
            } else {
              this.toastService.show({
                message: resp?.message || this.localeService.getValue('kyc_id_veri_fail'),
                type: 'fail',
                title: '',
              });
              this.close();
              this.submitLoading = false;
            }
          });
        break;
      case 'POA':
        this.submitLoading = true;
        this.riskApi
          .getRequestDocument()
          .pipe(
            switchMap(data => {
              if (data) {
                return this.riskApi.postUploadPoaVerification({
                  id: data?.proofOfAddress?.id || '',
                  country: this.countryCode,
                  address: this.address,
                  city: this.city,
                  postalCode: this.zipCode,
                  screenshotProof: this.uploadData().POA.upload.imgFileUrl,
                  originalFileName: this.uploadData().POA.upload.poaImgName,
                });
              }
              return of(null);
            }),
          )
          .subscribe((resp: ResponseData<boolean> | null) => {
            if (resp?.data) {
              this.kycService._refreshKycStatus.set('fori-mid-kyc-POA-Supplyment');
              this.successPop();
            } else {
              this.toastService.show({
                message: resp?.message || this.localeService.getValue('kyc_poa_veri_fail'),
                type: 'fail',
                title: '',
              });
              this.close();
              this.submitLoading = false;
            }
          });
        break;
      default:
        break;
    }
  }
}
