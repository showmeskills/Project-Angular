import { ConnectedPosition } from '@angular/cdk/overlay';
import { Component, ElementRef, Input, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { timer } from 'rxjs';
import { ResourceApi } from 'src/app/shared/apis/resource.api';
import { UploadItem } from 'src/app/shared/interfaces/risk-control.interface';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { ToastService } from 'src/app/shared/service/toast.service';

@Component({
  selector: 'app-risk-uploader',
  templateUrl: './risk-uploader.component.html',
  styleUrls: ['./risk-uploader.component.scss'],
})
export class RiskUploaderComponent implements OnInit {
  constructor(private localeService: LocaleService, private toast: ToastService, private resourceApi: ResourceApi) {}
  @Input() uploadList: { [key: string]: UploadItem } = {};
  /**是否禁用 */
  @Input() disabled: boolean = false;
  isH5!: boolean;

  /** web 大图定位 位置 */
  positions: ConnectedPosition[] = [
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: 0, offsetX: -100 },
  ];

  /** h5 大图定位 位置 */
  h5Positions: ConnectedPosition[] = [{ originX: 'start', originY: 'center', overlayX: 'start', overlayY: 'bottom' }];

  /** 当前主题颜色 */
  theme!: string;
  ngOnInit() {}

  /**
   * 文件上传
   *
   * @param event 事件
   * @param key 上传图片的数组 对象
   */
  @ViewChildren('imgGroup') imgGroup!: any;
  onUpload(event: Event, key: any) {
    const currentUpload = this.uploadList[key];
    const target = event.target as HTMLInputElement;
    if (!target.value) return;
    if (currentUpload.isVideo) {
      this.uploadVideo(target, currentUpload);
    } else {
      this.uploadImages(target, currentUpload);
    }
  }

  /**
   *  图片上传
   *
   * @param target
   * @param currentUpload
   * @returns
   */
  uploadImages(target: HTMLInputElement, currentUpload: UploadItem) {
    if (currentUpload.fileList?.length === 3) {
      this.toast.show({ message: this.localeService.getValue('upload_max', 3), type: 'fail', title: '' });
      target.value = '';
      return;
    }

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

    //通过检验，开始上传
    currentUpload.loading = true;
    this.resourceApi.uploadFile(file, fileType, 'Kyc').subscribe(url => {
      if (url) {
        currentUpload.fileList?.push(url);
        currentUpload.currentIdx = currentUpload.fileList.length - 1;
        currentUpload.isShowSkeleton = true;
        const timer = setInterval(() => {
          if (this.imgGroup._results[currentUpload.currentIdx!].nativeElement.complete) {
            currentUpload.isShowSkeleton = false;
            target.value = '';
            currentUpload.loading = false;
            clearInterval(timer);
          }
        }, 200);
      } else {
        target.value = '';
        currentUpload.loading = false;
        this.toast.show({ message: this.localeService.getValue('up_img_f'), type: 'fail', title: '' });
      }
    });
  }

  /**
   * 放大图片
   *
   * @param item 图片数据
   * @param key 上传图片的数组 对象
   */
  @ViewChild('enlargeImage') enlargeImage!: ElementRef;
  enLargeImg(item: string, key: any) {
    this.uploadList[key].isShowEnlargeImg = true;
    timer(200).subscribe(_ => {
      this.enlargeImage.nativeElement.src = item;
      console.log(this.enlargeImage.nativeElement.complete);
      this.enlargeImage.nativeElement.onload = () => {
        this.uploadList[key].isShowCloseBtn = true;
      };
    });
  }

  /**
   * 关闭大图
   *
   * @param key 数据key值
   */
  onCloseEnlargeImg(key: any) {
    this.uploadList[key].isShowEnlargeImg = false;
    this.uploadList[key].isShowCloseBtn = false;
  }

  /**
   * 移除图片
   *
   * @param item 数据
   * @param key 数据的值
   * @param imageItem
   */
  removeItem(key: string, imageItem?: string) {
    if (!imageItem) {
      this.uploadList[key].fileList.pop();
      this.uploadList[key].videoUrl = '';
      return;
    }
    this.uploadList[key].fileList = this.uploadList[key]?.fileList?.filter((list: string) => list !== imageItem);
    this.uploadList[key].currentIdx = this.uploadList[key].fileList!.length - 1 || 0;
  }

  trackMethod(index: any, item: any) {
    return item.value;
  }

  /**
   * 视频上传
   *
   * @param target
   * @param currentUpload
   */
  uploadVideo(target: HTMLInputElement, currentUpload: UploadItem) {
    if (currentUpload.fileList.length == 1) {
      this.toast.show({ message: this.localeService.getValue('upload_max', 1), type: 'fail', title: '' });
      target.value = '';
      return;
    }

    const file = target.files && target.files[0];
    if (!file) return;

    // 文件类型验证
    const fileType = file.type.toLowerCase();
    if (!['video/mp4', 'video/mp3', 'video/mov', 'video/rmvb', 'video/quicktime'].includes(fileType)) {
      this.toast.show({ message: this.localeService.getValue('unsupp_file'), type: 'fail', title: '' });
      target.value = '';
      return;
    }

    // 视频大小验证 30M
    const fileMaxSize = 1024 * 1024 * 30;
    if (file.size > fileMaxSize) {
      this.toast.show({ message: this.localeService.getValue('file_limerr'), type: 'fail', title: '' });
      target.value = '';
      return;
    }

    //通过检验，开始上传
    currentUpload.loading = true;
    this.resourceApi.uploadFile(file, fileType, 'Kyc').subscribe(url => {
      if (url) {
        currentUpload.fileList.push(url);
        currentUpload.videoUrl = url;
      } else {
        this.toast.show({ message: this.localeService.getValue('up_video_s'), type: 'fail', title: '' });
      }
      target.value = '';
      currentUpload.loading = false;
    });
  }
}
