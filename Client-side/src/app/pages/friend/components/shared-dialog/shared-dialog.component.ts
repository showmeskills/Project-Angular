import { Component, Inject, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FriendApi } from 'src/app/shared/apis/friend.api';
import { ImgCarouselOptions } from 'src/app/shared/components/img-carousel/img-carousel-options.interface';
import { ImgCarouselComponent } from 'src/app/shared/components/img-carousel/img-carousel.component';
import { DataCollectionService } from 'src/app/shared/service/data-collection.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { AppService } from './../../../../app.service';
import { FriendService } from './../../friend.service';

@UntilDestroy()
@Component({
  selector: 'app-shared-dialog',
  templateUrl: './shared-dialog.component.html',
  styleUrls: ['./shared-dialog.component.scss'],
})
export class SharedDialogComponent implements OnInit {
  constructor(
    private layout: LayoutService,
    public dialogRef: MatDialogRef<SharedDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { isShowGigComponent: boolean },
    private friendService: FriendService,
    private friendApi: FriendApi,
    private appService: AppService,
    private localeService: LocaleService,
    private toast: ToastService,
    private dataCollectionService: DataCollectionService
  ) {}

  isH5!: boolean;
  loading: boolean = false;
  list: any[] = [
    // { icon: "icon-twitter" },
    // { icon: "icon-fb" },
    // { icon: "icon-ins" },
    // { icon: "icon-sina" },
    // { icon: "icon-qq" },
    { icon: 'icon-ring-download' },
  ];
  btnList: any[] = [
    {
      size: 'small-size',
      text: '9:16',
    },
    {
      size: 'mid-size',
      text: '1:1',
    },
    {
      size: 'large-size',
      text: '16:9',
    },
  ]; // 轮播底部的按钮
  isShowSharedComponent: boolean = true; //是否显示
  sharedList: any[] = [
    { img: 'assets/images/friend/h5-shared-transi.png', text: this.localeService.getValue('shared_gk') },
    { img: 'assets/images/friend/h5-shared-telegram.png', text: 'telegram' },
    { img: 'assets/images/friend/h5-shared-wechat.png', text: this.localeService.getValue('shared_v') },
    { img: 'assets/images/friend/h5-shared-email.png', text: this.localeService.getValue('shared_e') },
  ]; // 分享数据
  smallQrData: any = {}; //小qr 数据
  currentIdx: number = 0;
  isAgentLogon!: boolean;
  imgSizeIndex: number = 0;
  downLoading: boolean = false;

  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    this.friendService.defaultLinkData$.pipe(untilDestroyed(this)).subscribe(v => {
      this.smallQrData = v;
    });
    this.friendService.agentLogin$.pipe(untilDestroyed(this)).subscribe(v => {
      this.isAgentLogon = v;
    });
    this.loadImgData(this.btnList[this.imgSizeIndex].text);
  }

  sharedSwiperData: any[] = [];
  async loadImgData(proportion: string) {
    this.loading = true;
    const params = {
      affiliateType: this.isAgentLogon ? 1 : 2,
      deviceType: this.isH5 ? 'h5' : 'pc',
      language: this.appService.languageCode,
      proportion: proportion,
    };
    await this.friendApi.getShareImg(params).then((result: any) => {
      this.loading = false;
      if (result?.data) {
        this.sharedSwiperData = [...this.sharedSwiperData, { img: result.data }];
        if (this.sharedSwiperData.length === 3) {
        } else {
          this.imgSizeIndex++;
          this.loadImgData(this.btnList[this.imgSizeIndex].text);
        }
      }
    });
  }

  //---------------------------------分享轮播
  @ViewChild('sharedSwiperComponent') sharedSwiper!: ImgCarouselComponent;
  sharedSwiperOptions: ImgCarouselOptions = {
    loop: false,
    speed: 300,
    autoplay: false,
  };
  //上一页
  onLastSlide() {
    this.sharedSwiper.slidePrev();
  }
  //下一页
  onNextSlide() {
    this.sharedSwiper.slideNext();
  }
  indexChange(e: number) {
    this.currentIdx = e;
  }
  //click 底部滑动图片
  onClickSlide(i: number) {
    this.currentIdx = i;
    this.sharedSwiper.slideTo(i);
  }
  // close popup
  close() {
    this.dialogRef.close();
  }
  // 点击分享icon切换组件
  toSharedComponent() {
    this.isShowSharedComponent = !this.isShowSharedComponent;
  }

  /**
   * 图片下载
   */
  @ViewChildren('imgContainer') imgContainer!: any;
  @ViewChildren('qrCanvas') qrCanvas!: any;
  downloadImg() {
    this.dataCollectionService.addPoint({ eventId: 30017 });
    this.downLoading = true;
    // 定义下载属性
    const url = this.sharedSwiperData[this.currentIdx].img;
    const aDom = document.createElement('a');
    aDom.setAttribute('download', `${this.btnList[this.currentIdx].size}.jpg`);
    aDom.setAttribute('target', '_blank');

    //创建一个画布，并且把请求的接口图片画上去
    const container: any = this.imgContainer._results[this.currentIdx].nativeElement;
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    const canvasEl = document.createElement('canvas');
    canvasEl.width = width;
    canvasEl.height = height;

    const ctx = canvasEl.getContext('2d');
    const img = new Image();
    img.src = url + '?timestempa=' + new Date().getTime();
    img.setAttribute('crossOrigin', 'Anonymous');

    // 用canvas 画一个二维码
    const qrCanvas = this.qrCanvas._results[this.currentIdx].nativeElement.children[0].children[0];
    const qrWidth = qrCanvas.offsetWidth;
    const qrHeight = qrCanvas.offsetHeight;
    const qrCode = this.convertCanvasToImage(qrCanvas);

    //生成图片并下载
    img.onload = () => {
      ctx?.drawImage(img, 0, 0, width, height);
      ctx?.drawImage(qrCode, 12, height - 3 - qrHeight, qrWidth, qrHeight);
      const base64 = canvasEl.toDataURL('image/jpg');
      aDom.href = base64;
      aDom.click();
      this.toast.show({ message: this.localeService.getValue('img_succ'), type: 'success' });
      this.downLoading = false;
    };
  }

  /**
   * 将canvas转为图片
   *
   * @param canvas 元素
   * @param canvas.toDataURL
   * @returns
   */
  convertCanvasToImage(canvas: { toDataURL: (arg0: string) => string }) {
    const image = new Image();
    image.src = canvas.toDataURL('image/png');
    return image;
  }
}
