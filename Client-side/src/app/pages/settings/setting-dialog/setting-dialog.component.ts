import { Component, ElementRef, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { finalize } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { SettingsService } from 'src/app/pages/settings/settings.service';
import { AuthApi } from 'src/app/shared/apis/auth.api';
import { ResourceApi } from 'src/app/shared/apis/resource.api';
import { SettingsApi } from 'src/app/shared/apis/settings.api';
import { InvisibleOptions, defaultAvatarPc } from 'src/app/shared/interfaces/settings.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { KycApi } from './../../../shared/apis/kyc-basic.api';
import { ToastService } from './../../../shared/service/toast.service';
export type DialogDataSubmitCallback<T> = (row: T) => void;
@UntilDestroy()
@Component({
  selector: 'app-setting-dialog',
  templateUrl: './setting-dialog.component.html',
  styleUrls: ['./setting-dialog.component.scss'],
})
export class SettingDialogComponent implements OnInit {
  loading: boolean = false;
  isH5!: boolean;
  allLangData: any[] = [];
  selectedLanguage: string = '';
  keyWord: string = '';
  /** 用户默认头像列表 */
  avatarList!: defaultAvatarPc[];
  settingRateList: any[] = [{ name: 'accept_odds' }, { name: 'acc_better_odd' }, { name: 'acc_no_change' }];
  oddsTypeList: any[] = [];
  betMode: any[] = [
    { id: 'euro', name: this.localeService.getValue('european') },
    { id: 'asia', name: this.localeService.getValue('asian') },
  ];
  selectOddsType: string = '';
  selectedBetMode: 'asia' | 'euro' | string = '';
  selectedRate: string = '';
  uploadAvator: string = '';
  uploadAvatorFile?: File;
  uploadAvatorProcess: number = -1;
  /** 被选中默认头像的序号 */
  isSelectedAvatoridx: number = -1;
  avatorBtns: string[] = ['default_text', 'upload'];
  isActiveAvatorBtnIdx: number = 0;
  fileName: string | null = null;
  avatarUrl: string | null = null;
  availableSubmit: boolean = false;
  newFileName: string | null = null;
  croppedImage!: File;

  /**@bettingBtns 默认注码按钮*/
  bettingBtns: string[] = ['crypto', 'fiat_cur'];

  /**@isHideDefault */
  isHideDefault: boolean = false;

  /**@avatarLoading */
  avatarLoading: boolean = false;

  /**@imgInCropperWidth 需要裁剪的图片宽度 */
  imgInCropperWidth!: number;

  /**@digitalCurrencies 数字币*/
  digitalCurrencies: any = [];

  /**@legalCurrencies 法币*/
  legalCurrencies: any = [];

  /**@currencies 当前选择的货币 */
  currencies: any = [];

  /** 隐身模式选项 */
  invisibleOptions: InvisibleOptions[] = [
    { key: this.localeService.getValue('show_username'), value: 'ShowUserName' },
    { key: this.localeService.getValue('show_uid'), value: 'ShowUid' },
    { key: this.localeService.getValue('fully_invisible'), value: 'Invisibility' },
  ];

  /** 选择隐身模式 */
  selectedInvisibleMode!: 'ShowUserName' | 'ShowUid' | 'Invisibility' | '';

  /** 隐身模式loading */
  invisibleLoading: boolean = false;

  constructor(
    private appService: AppService,
    private dialogRef: MatDialogRef<SettingDialogComponent>,
    private toast: ToastService,
    private layout: LayoutService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      callback: DialogDataSubmitCallback<any>;
      settingidx: number;
      title: string;
      settingDesc: string;
      settingItem: any[];
      isMulptiBtns: boolean | null;
      success: boolean;
    },
    private settingsApi: SettingsApi,
    private authApi: AuthApi,
    private kycApi: KycApi,
    private localeService: LocaleService,
    private settingService: SettingsService,
    private resourceApi: ResourceApi
  ) {}

  @HostListener('document:keydown.enter', ['$event'])
  onEnter(event: KeyboardEvent) {
    //默认头像
    if (this.data.isMulptiBtns && this.availableSubmit) {
      this.confirm();
    } else if ((!this.data.isMulptiBtns && this.data.settingidx == 6) || this.data.settingidx == 3) {
      //重置语言
      this.save();
    } else if ((!this.data.isMulptiBtns && this.data.settingidx == 4) || this.data.settingidx == 5) {
      //赔率格式  4
      //视图格式  5
      this.save();
    } else if ((!this.data.isMulptiBtns && this.data.settingidx == 1) || this.data.settingidx == 7) {
      //站内信设置
      this.save();
    } else if (!this.data.isMulptiBtns) {
      //上传头像
      this.confirm();
    }
  }

  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(v => (this.isH5 = v));
    this.appService.languages$.pipe(untilDestroyed(this)).subscribe(x => {
      this.allLangData = x;
    });
    //this.oddsTypeList = this.appService.oddsTypeList;
    //订阅当前货币
    this.appService.currencies$.pipe(untilDestroyed(this)).subscribe(x => {
      if (x.length > 0) {
        this.currencies = this.digitalCurrencies = x.filter(v => v.isVisible && v.isDigital);
        this.legalCurrencies = x.filter(v => v.isVisible && !v.isDigital);
      }
    });
    if (this.data.settingidx === 11) {
      this.settingService.invisibleMode$.pipe(untilDestroyed(this)).subscribe(v => {
        this.selectedInvisibleMode = v;
      });
    }
    //获取后台上传的所有默认头像
    this.avatarList = this.appService.avatarList;
    this.appService.userInfo$.pipe(untilDestroyed(this)).subscribe(x => {
      if (x) {
        const temp = x.avater;
        this.isSelectedAvatoridx = this.avatarList.findIndex(y => y.processedUrl == temp);
      }
    });
    //实时更新
    this.confirm();
  }
  save(): void {
    switch (this.data.settingidx) {
      case 0:
        this.onModifyAvatar();
        return;
      case 1:
        this.data.callback(this.data);
        this.close();
        return;
      case 2:
        if (this.selectedRate.length == 0) this.selectedRate = 'not_set';
        this.data.callback({ ...this.data, rate: this.selectedRate });
        this.close();
        return;
      case 3:
        this.data.callback({ ...this.data, lang: this.selectedLanguage });
        this.close();
        return;
      case 4:
        //this.modifyOddsFormat();
        return;
      case 5:
        //this.modifyViewFormat();
        return;
      case 6:
        this.setNoticeLang();
        return;
      case 7:
        this.setReceiveNoticeTypeList();
        return;
      case 11:
        this.setInvisibleMode(this.selectedInvisibleMode);
        return;
      default:
        break;
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  /**
   * 头像裁剪 切换; 币种切换
   *
   * @idx 获取类型下标
   * @isAvator 默认是头像切换
   */
  @ViewChild('tabActive') tabActive!: ElementRef;
  onChangeAvatorType(idx: number, isAvator: boolean = true) {
    this.tabActive.nativeElement.style = `transform:translateX(${idx * 83}px)`;
    this.isActiveAvatorBtnIdx = idx;
    this.isSelectedAvatoridx = -1;
    if (isAvator) {
      this.availableSubmit = false;
      this.uploadAvatorFile = undefined;
    } else {
      if (idx === 0) {
        this.currencies = this.digitalCurrencies;
      } else if (idx === 1) {
        this.currencies = this.legalCurrencies;
      }
    }
  }

  // 选择默认头像
  onSelectAvator(idx: number) {
    this.isSelectedAvatoridx = idx;
    if (this.isSelectedAvatoridx !== -1) {
      this.availableSubmit = true;
    }
  }
  /**
   * 上传图片后判断
   *
   * @param event
   * @event 上传的图片文件
   */
  onUploadAvator(event: any) {
    const files = (event.target as HTMLInputElement).files;
    const fileFilter = 'image/png|image/jpg|image/jpeg|';
    if (files && files[0]) {
      const file = files[0];
      this.fileName = file.name;
      if (fileFilter.indexOf(file.type.toLowerCase()) > -1 && !!file.type.length) {
        this.isHideDefault = true;
        this.uploadAvatorFile = file;
      } else {
        this.toast.show({
          message: this.localeService.getValue('img_for_err', 'png jpg jpeg'),
          type: 'fail',
        });
      }
    }
  }

  imageCropped(event: ImageCroppedEvent) {
    const dataUrlToFile = (dataUrl: string, fileName: any) => {
      const arr: any = dataUrl.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let len = bstr.length;
      const u8arr = new Uint8Array(len);
      while (len--) {
        u8arr[len] = bstr.charCodeAt(len);
      }
      return new File([u8arr], fileName, { type: mime });
    };
    const newFile = dataUrlToFile(event.base64 ?? '', `base64-${this.fileName}`);
    if (newFile) {
      this.newFileName = newFile.name;
      this.croppedImage = newFile;
      this.availableSubmit = true;
    }
  }

  //图片认证
  async uploadImgUrl() {
    const isCropper = true;
    if (isCropper) {
      this.avatarLoading = true;
      if (this.newFileName) {
        this.resourceApi.uploadFile(this.croppedImage, this.croppedImage.type.toLowerCase(), 'User').subscribe(url => {
          this.avatarLoading = false;
          if (url) {
            this.avatarUrl = url;
            this.save();
          } else {
            this.toast.show({ message: this.localeService.getValue('up_fa'), type: 'fail' });
            this.data.success = false;
            this.close();
          }
        });
      }
    } else {
      this.toast.show({ message: this.localeService.getValue('crop_fa'), type: 'fail' });
    }
  }

  // 清除图片
  clearImg() {
    this.uploadAvatorProcess = -1;
    this.uploadAvator = '';
    this.availableSubmit = false;
    this.isHideDefault = false;
  }

  // 确认上传
  confirm() {
    if (!this.availableSubmit) return;
    if (this.isActiveAvatorBtnIdx == 0) {
      if (this.avatarList.length > 0) {
        if (
          this.avatarList[this.isSelectedAvatoridx]?.url.startsWith('http') ||
          this.avatarList[this.isSelectedAvatoridx]?.url.includes('avatar')
        ) {
          this.avatarUrl = this.avatarList[this.isSelectedAvatoridx]?.url;
        } else {
          this.avatarUrl = this.avatarList[this.isSelectedAvatoridx]?.processedUrl; //选择的头像，后台有配图
        }
      }

      this.save();
    } else {
      this.uploadImgUrl();
    }
  }

  //更新头像
  onModifyAvatar() {
    if (this.isActiveAvatorBtnIdx == 0) {
      if (this.avatarUrl === null) {
        this.close();
        return;
      }
    } else {
      if (this.fileName === null) {
        this.close();
        return;
      }
    }
    this.avatarLoading = true;
    // 上传默认头像
    this.authApi
      .modifyAvatar({ avatar: this.avatarUrl! })
      .pipe(
        finalize(() => {
          this.avatarLoading = false;
          this.close();
          this.data.callback(this.data); //渲染头像到模板
        })
      )
      .subscribe(data => {
        if (data) {
          this.data.success = true;
        } else {
          this.data.success = false;
        }
      });
  }

  //设置站内信语言
  setNoticeLang() {
    if (this.selectedLanguage.length == 0) {
      this.toast.show({ message: this.localeService.getValue('vaild_lang'), type: 'fail' });
      return;
    }
    this.loading = true;
    const params = {
      language: this.allLangData.filter(lang => lang.name === this.selectedLanguage)[0].code,
    };
    this.settingsApi.setNoticeLang(params).subscribe(data => {
      this.loading = false;
      this.data.success = data;
      this.close();
      this.data.callback(this.data);
    });
  }

  /**@setReceiveNoticeTypeList 设置站内信接受通知类型*/
  setReceiveNoticeTypeList() {
    this.loading = true;
    const params = {
      noticeTypeList: this.data.settingItem.filter(item => item.active === true).map(item => item.enName),
    };
    this.settingsApi.setReceiveNoticeTypeList(params).subscribe(data => {
      this.loading = false;
      this.data.success = data;
      this.close();
      this.data.callback(this.data);
    });
  }

  /**设置赔率格式*/
  // modifyOddsFormat() {
  //   if (!this.selectOddsType.length) {
  //     this.toast.show({ message: this.localeService.getValue('sel_odd_for'), type: 'fail' });
  //     return;
  //   }
  //   this.loading = true;
  //   this.settingsApi.modifyOddsFormat({ oddsFormat: this.selectOddsType }).pipe(
  //     finalize(() => {
  //       this.loading = false;
  //       this.data.callback(this.data);
  //       this.close();
  //     })
  //   ).subscribe(data => {
  //     if (data) {
  //       this.data.success = true;
  //       this.localStorageService.oddsType = this.selectOddsType;
  //       this.appService.oddsType = this.selectOddsType;
  //       this.appService.oddsType$.next(this.selectOddsType);
  //     } else {
  //       this.data.success = false;
  //     }
  //   })
  // }

  /**设置视图格式*/
  // modifyViewFormat() {
  //   if (!this.selectedBetMode.length) {
  //     this.toast.show({ message: this.localeService.getValue('sel_view_for'), type: 'fail' });
  //     return;
  //   }
  //   this.loading = true;
  //   this.settingsApi.modifyViewFormat({ viewFormat: this.selectedBetMode }).pipe(
  //     finalize(() => {
  //       this.loading = false;
  //       this.data.callback(this.data);
  //       this.close();
  //     })
  //   ).subscribe(data => {
  //     if (data) {
  //       this.data.success = true;
  //       this.localStorageService.betMode = this.selectedBetMode;
  //       this.appService.betMode$.next(this.selectedBetMode as 'asia' | 'euro');
  //     } else {
  //       this.data.success = false;
  //     }
  //   })
  // }

  /**
   * 设置隐身模式
   *
   * @param params
   */
  setInvisibleMode(params: 'ShowUserName' | 'ShowUid' | 'Invisibility' | '') {
    this.invisibleLoading = true;
    this.settingsApi.setInvisibleMode(params).subscribe(data => {
      this.invisibleLoading = false;
      if (data) {
        this.settingService.invisibleMode$.next(params);
        this.data.success = true;
      } else {
        this.data.success = false;
      }
      this.data.callback(this.data);
      this.close();
    });
  }
}
