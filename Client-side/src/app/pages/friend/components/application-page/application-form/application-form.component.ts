import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { FriendApi } from 'src/app/shared/apis/friend.api';
import { KycApi } from 'src/app/shared/apis/kyc-basic.api';
import { ResourceApi } from 'src/app/shared/apis/resource.api';
import { DataCollectionService } from 'src/app/shared/service/data-collection.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { NativeAppService } from 'src/app/shared/service/native-app.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { appOrWebDomain } from '../../../friend.helper';

@UntilDestroy()
@Component({
  selector: 'app-application-form',
  templateUrl: './application-form.component.html',
  styleUrls: ['./application-form.component.scss'],
})
export class ApplicationFormComponent implements OnInit {
  isH5!: boolean;

  /**@loading 表单loading */
  loading: boolean = false;

  /**@formData 表单申请数据*/
  formData: any = [
    {
      max: 20,
      label: this.localeService.getValue('nname_text'),
      data: 'nickname',
      nickname: '',
      required: true,
      placeHolder: this.localeService.getValue('max_chara'),
      isInput: true,
    },
    {
      max: 60,
      label: this.localeService.getValue('contact_info_text'),
      data: 'contact',
      contact: '',
      required: true,
      placeHolder: this.localeService.getValue('fill_contact_way'),
      isInput: true,
    },
    {
      max: 20,
      label: this.localeService.getValue('belong_c_r'),
      data: 'userAddress',
      userAddress: '',
      required: true,
      placeHolder: this.localeService.getValue('max_chara'),
      isInput: true,
    },
    {
      label: this.localeService.getValue('type_agent'),
      data: 'proxyType',
      proxyType: '',
      agentList: [
        this.localeService.getValue('people'),
        this.localeService.getValue('bet_comm'),
        this.localeService.getValue('boi'),
      ],
      isRadio: true,
    },
    {
      label: this.localeService.getValue('focu_area'),
      data: 'transactionRegion',
      transactionRegion: '',
      list: [
        { game: this.localeService.getValue('sports'), value: false },
        { game: this.localeService.getValue('esport'), value: false },
        { game: this.localeService.getValue('live_cas'), value: false },
        { game: this.localeService.getValue('slat'), value: false },
        { game: this.localeService.getValue('lottery'), value: false },
        { game: this.localeService.getValue('chess'), value: false },
      ],
      isCheckBox: true,
    },
    {
      max: 60,
      label: this.localeService.getValue('breif_intro'),
      data: 'platformOverview',
      platformOverview: '',
      required: true,
      placeHolder: this.localeService.getValue('intro_text'),
      isInput: true,
    },
    {
      max: 60,
      label: this.localeService.getValue('main_platform_link'),
      data: 'platformAddress',
      platformAddress: '',
      required: true,
      placeHolder: this.localeService.getValue('intro_text'),
      isInput: true,
    },
    {
      max: 20,
      label: this.localeService.getValue('num_fans'),
      data: 'fansNumber',
      fansNumber: '',
      required: true,
      placeHolder: this.localeService.getValue('max_chara'),
      isInput: true,
    },
    {
      label: this.localeService.getValue('prove_ceri'),
      data: 'fansNumberProveUrl',
      fansNumberProveUrl: '',
      isUpload: true,
      isReadyUploadedImg: true,
    },
    {
      max: 20,
      label: this.localeService.getValue('manager_familiar'),
      data: 'channelManager',
      channelManager: '',
      required: false,
      placeHolder: this.localeService.getValue('max_chara'),
      isInput: true,
    },
    {
      max: 60,
      label: this.localeService.getValue('ind_media'),
      data: 'industryMedia',
      industryMedia: '',
      required: false,
      placeHolder: this.localeService.getValue('intro_text'),
      isInput: true,
    },
    {
      max: 60,
      label: this.localeService.getValue('trade_platform'),
      data: 'transactionPlatform',
      transactionPlatform: '',
      required: false,
      placeHolder: this.localeService.getValue('intro_text'),
      isInput: true,
    },
    {
      max: 60,
      label: this.localeService.getValue('tel_channel'),
      data: 'telegramGroup',
      telegramGroup: '',
      required: false,
      placeHolder: this.localeService.getValue('intro_text'),
      isInput: true,
    },
    {
      max: 60,
      label: this.localeService.getValue('nname_link'),
      data: 'weibo',
      weibo: '',
      required: false,
      placeHolder: this.localeService.getValue('intro_text'),
      isInput: true,
    },
    {
      max: 60,
      label: this.localeService.getValue('wechat_group'),
      data: 'wechat',
      wechat: '',
      required: false,
      placeHolder: this.localeService.getValue('intro_text'),
      isInput: true,
    },
    {
      max: 60,
      label: this.localeService.getValue('samll_cir'),
      data: 'circle',
      circle: '',
      required: false,
      placeHolder: this.localeService.getValue('intro_text'),
      isInput: true,
    },
    {
      max: 60,
      label: this.localeService.getValue('remark'),
      data: 'remarks',
      remarks: '',
      required: false,
      placeHolder: this.localeService.getValue('intro_text'),
      isInput: true,
    },
  ];

  imgSize: number = 0;

  fileName: string | null = null;

  fileImg!: File;

  constructor(
    private router: Router,
    private layout: LayoutService,
    private toast: ToastService,
    private friendApi: FriendApi,
    public appService: AppService,
    private kycApi: KycApi,
    private localeService: LocaleService,
    private dataCollectionService: DataCollectionService,
    private nativeAppService: NativeAppService,
    private resourceApi: ResourceApi
  ) {}

  affiliateUrl: string = `${appOrWebDomain()}/${this.appService.languageCode}/referral/application/affiliate`;

  ngOnInit(): void {
    this.nativeAppService.setNativeTitle('agent_p');
    this.dataCollectionService.setEnterTime('affiliateDescription');
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(v => (this.isH5 = v));
    this.dataCollectionService.addPoint({ eventId: 30015 });
  }

  /**
   * @param i
   * @param index
   * @selectRegion 选择国家
   * @i 主数据下标
   * @index 子数据下标
   */
  selectRegion(i: number, index: number) {
    this.formData[i].transactionRegion = this.formData[i].list
      .map((list: any, idx: number) => {
        if (index === idx) list.value = !list.value;
        return list;
      })
      .filter((item: any) => item.value === true)
      .map((item: any) => item.game)
      .toString();
  }

  /**
   * @param value
   * @param index
   * @param data
   * @onChange input change 事件
   * @value input 值
   * @data 建名
   */
  onChange(value: string, index: number, data: string) {
    this.formData[index][data] = value;
  }

  /**@onSubmitForm 提交表单申请 */
  onSubmitForm() {
    const params = {} as any;
    this.formData.forEach((formData: any) => {
      params[formData.data] = formData[formData.data];
    });
    this.loading = true;
    this.friendApi.agentApply(params).then((data: any) => {
      this.loading = false;
      if (data?.data) {
        this.toast.show({ message: this.localeService.getValue('app_s'), type: 'success' });
        this.router.navigateByUrl(`/${this.appService.languageCode}/referral/home`);
      } else {
        this.toast.show({ message: data.message || this.localeService.getValue('app_f'), type: 'fail' });
      }
    });
  }

  /**@canSubmit 是否可以提交表单 */
  canSubmit(): boolean {
    const formData = this.formData.filter((form: any) => form.required).filter((form: any) => !!form[form.data].length);
    return formData.length === 6 && !this.loading;
  }

  /**@uploadImg 处理本地图片 */
  uploadImg(event: any): void {
    const files = (event.target as HTMLInputElement).files;
    const fileMaxSize = 1024 * 1024 * 5;
    if (files && files[0]) {
      const file = files[0];
      this.fileImg = file;
      this.fileName = file.name;
      const fileFilter = 'image/png|image/gif|image/jpg|image/bmp|image/jpeg|';
      if (fileFilter.indexOf(file.type.toLowerCase()) > -1 && !!file.type.length) {
        if (file.size < fileMaxSize) {
          this.onReadImg(file);
        } else {
          this.toast.show({ message: this.localeService.getValue('img_size_err', '5MB'), type: 'fail' });
        }
      } else {
        this.toast.show({
          message: this.localeService.getValue('img_for_err', 'jpg, png, gif, bmp, jpeg'),
          type: 'fail',
        });
      }
    }
  }

  /**@onReadImg 读取本地图片 */
  @ViewChild('img', { static: false }) img!: ElementRef;
  onReadImg(file: File): void {
    const render = new FileReader();
    render.readAsDataURL(file);
    render.onload = () => {
      this.img.nativeElement.src = render.result!.toString();
      this.img.nativeElement.onload = () => {
        this.formData[8].isReadyUploadedImg = !this.formData[8].isReadyUploadedImg;
        this.img.nativeElement.style.display = 'block';
        if (!this.formData[8].isReadyUploadedImg) {
          this.uploadImgUrl();
        }
      };
    };
  }

  /**@uploadImgUrl 图片上传认证 */
  uploadImgUrl() {
    this.loading = true;
    if (this.fileName) {
      this.resourceApi.uploadFile(this.fileImg, this.fileImg.type.toLowerCase(), 'Agent').subscribe(url => {
        this.loading = false;
        if (url) {
          this.formData[8].fansNumberProveUrl = url;
          this.toast.show({ message: this.localeService.getValue('up_img_s'), type: 'success', title: '' });
        } else {
          this.toast.show({ message: this.localeService.getValue('up_img_f'), type: 'fail', title: '' });
        }
      });
    }
  }

  /**@clearImg 删除上传图片 */
  clearImg() {
    this.img.nativeElement.removeAttribute('src');
    this.img.nativeElement.removeAttribute('style');
    this.formData[8].fansNumberProveUrl = '';
    this.formData[8].isReadyUploadedImg = !this.formData[8].isReadyUploadedImg;
  }

  ngOnDestroy(): void {
    this.dataCollectionService.addPoint({
      eventId: 30014,
      actionValue1: this.dataCollectionService.getTimDiff('affiliateDescription'),
      actionValue2: 2,
    });
  }
}
