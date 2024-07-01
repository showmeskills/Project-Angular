import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, DestroyRef, Input, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialogRef } from '@angular/material/dialog';
import { Subscription, combineLatest, of, timer } from 'rxjs';
import { ChatApi } from 'src/app/shared/apis/chat.api';
import { ChatMsgAsset } from 'src/app/shared/interfaces/chat.interface';
import { ResponseData } from 'src/app/shared/interfaces/response.interface';
import { ChatService } from 'src/app/shared/service/chat.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { PopupService } from 'src/app/shared/service/popup.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { ChatMessageClass, FailReason, MATCH_MIX_REGEXP, SPLIT_MIX_REGEXP } from './chat-message-class';

interface MixRenderContent {
  /**0=>文本,1=>图片,3=>视频,7=>文件 */
  msgType: number;
  /**拆分后的content */
  content: string;
  /**msgType不等0时候，从content中解释出来的资源id */
  assetid?: string;
}

@Component({
  selector: 'app-message-item',
  templateUrl: './message-item.component.html',
  styleUrls: ['./message-item.component.scss'],
})
export class MessageItemComponent implements OnInit, OnDestroy {
  constructor(
    private chatService: ChatService,
    private destroyRef: DestroyRef,
    private popup: PopupService,
    private chatApi: ChatApi,
    private toast: ToastService,
    private localeService: LocaleService,
  ) {}

  @Input({ required: true }) data!: ChatMessageClass;

  direction: 'left' | 'right' | '' = '';

  showLoading = false;
  showProgress = false;

  statusTimer?: Subscription;

  defaultWidth = 300;
  defaultheight = 150;

  contents: MixRenderContent[] = [];

  /**显示loading的超时（超过这个时间显示发送loading） */
  loadingTimeOut = 0.7 * 1000;
  /**显示上传进度的超时（超过这个时间显示上传进度） */
  progressTimeOut = 1.5 * 1000;
  /**发送消息超时（超过这个时间标记为发送失败） */
  sendtMsgTimeOut = 10 * 1000;
  /**上传文件响应超时（超过这个时间标记为上传失败） */
  uploadResponse = 10 * 1000;

  mediaFId = '0';
  coverFid = '0';

  isOnSend() {
    return this.data.status === -1;
  }

  isWaitUpload() {
    return this.data.status === -2;
  }

  isOnUpload() {
    return this.data.status === 2;
  }

  isFail() {
    return this.data.status === 0;
  }

  upload$?: Subscription;

  ngOnInit() {
    this.data.mountsTo(this);
    this.direction = this.data.from === this.chatService.uid ? 'right' : 'left';
    this.buildContents();
    this.processStatus();
  }

  /**根据消息状态处理需要的操作 */
  processStatus() {
    switch (this.data.msgType) {
      case 0: {
        // 发送文字
        if (this.isOnSend()) {
          const { seq, createTime, msgType, content } = this.data;
          this.chatService.sendMsg({ seq, createTime, msgType, content });
          this.buildFinallyTimer();
        }
        break;
      }
      case 3: {
        //发送视频
        if (this.isWaitUpload()) {
          this.buildUploadTimer();
          const curAsset = this.data.asset[0];
          const videoFile = curAsset.localData?.file;
          const thumbFile = curAsset.localData?.thumbFile;
          const total = (videoFile?.size ?? 0) + (thumbFile?.size ?? 0);
          let videoLoaded = 0;
          let thumbLoaded = 0;
          let fid: string | undefined = undefined;
          let coverFid: string | undefined = undefined;
          let videoDone = false;
          let thumbDone = false;
          this.upload$ = combineLatest({
            videoFile: videoFile ? this.chatApi.upload(videoFile, this.chatService.chatToken) : of(null),
            thumbFile: thumbFile ? this.chatApi.upload(thumbFile, this.chatService.chatToken) : of(null),
          })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(e => {
              if (e.videoFile) {
                if (!videoDone) {
                  switch (e.videoFile.type) {
                    case HttpEventType.UploadProgress: {
                      videoLoaded = e.videoFile.loaded;
                      this.uploadStateUpdate(videoLoaded + thumbLoaded, total);
                      break;
                    }
                    case HttpEventType.Response: {
                      videoDone = true;
                      fid = this.interruptCheck(e.videoFile.body);
                      if (fid && videoDone && thumbDone) this.checkToSend(curAsset, fid, coverFid);
                      break;
                    }
                    default:
                      break;
                  }
                }
              } else {
                this.clean();
                this.data.setStatus(0, 'keyFileInvalid');
                return;
              }
              if (e.thumbFile) {
                if (!thumbDone) {
                  switch (e.thumbFile.type) {
                    case HttpEventType.UploadProgress: {
                      thumbLoaded = e.thumbFile.loaded;
                      this.uploadStateUpdate(videoLoaded + thumbLoaded, total);
                      break;
                    }
                    case HttpEventType.Response: {
                      thumbDone = true;
                      coverFid = e.thumbFile.body?.data?.fid ?? '';
                      if (fid && thumbDone && videoDone) this.checkToSend(curAsset, fid, coverFid);
                      break;
                    }
                    default:
                      break;
                  }
                }
              } else {
                thumbDone = true;
              }
            });
        } else if (this.isOnSend()) {
          const curAsset = this.data.asset[0];
          this.checkToSend(curAsset, this.mediaFId, this.coverFid);
        }
        break;
      }
      case 1:
      case 7: {
        // 发送图片和文件
        if (this.isWaitUpload()) {
          this.buildUploadTimer();
          const curAsset = this.data.asset[0];
          const file = curAsset.localData?.file;
          if (file) {
            this.upload$ = this.chatApi
              .upload(file, this.chatService.chatToken)
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe(e => {
                const imgRes = e as HttpEvent<ResponseData<{ fid: string }>>;
                switch (imgRes.type) {
                  case HttpEventType.UploadProgress: {
                    const total = curAsset.size ?? 0;
                    const loaded = imgRes.loaded;
                    this.uploadStateUpdate(loaded, total);
                    break;
                  }
                  case HttpEventType.Response: {
                    const fid = this.interruptCheck(imgRes.body);
                    if (fid) this.checkToSend(curAsset, fid);
                    break;
                  }
                  default:
                    break;
                }
              });
          } else {
            this.clean();
            this.data.setStatus(0, 'keyFileInvalid');
          }
        } else if (this.isOnSend()) {
          const curAsset = this.data.asset[0];
          this.checkToSend(curAsset, this.mediaFId);
        }
        break;
      }
      default:
        break;
    }
  }

  /**
   * 更新上传进度
   *
   * @param loaded
   * @param total
   */
  uploadStateUpdate(loaded: number, total: number) {
    // 报告了进度，说明在上传了，取消loading，显示或更新进度，无限等待完成
    if (!this.isOnUpload()) {
      this.data.setStatus(2);
      this.buildStatusTimer(this.progressTimeOut, this.isOnUpload, () => {
        this.showProgress = true;
      });
    }
    const progress = ((loaded > total ? total : loaded) / total) * 100;
    // 保留 1% 不显示满，留给其它数据的传输
    this.data.setProgress(progress >= 99 ? 99 : progress);
  }

  /**
   * 检查发送媒体消息
   *
   * @param asset
   * @param fid
   * @param coverFid
   */
  checkToSend(asset: ChatMsgAsset, fid: string, coverFid?: string) {
    if (!fid) {
      this.clean();
      this.data.setStatus(0, 'keyDataInvalid');
    } else {
      // 已上传完成，开始发送消息
      const { seq, createTime, msgType } = this.data;
      this.mediaFId = String(fid);
      this.coverFid = String(coverFid);
      this.chatService.sendMsg({
        seq,
        createTime,
        msgType,
        content: `#{${this.mediaFId}}#`,
        asset: [
          {
            ...asset,
            localData: undefined, //asset可能会带有本地资源对象，这里重新赋值覆盖掉
            fId: this.mediaFId,
            cover: this.coverFid,
          },
        ],
      });
      this.data.setStatus(-1);
      this.buildFinallyTimer();
    }
  }

  /**
   * 创建超时
   *
   * @param time
   * @param iftrue
   * @param dosome
   */
  buildStatusTimer(time: number, iftrue: () => boolean, dosome: () => void) {
    this.statusTimer?.unsubscribe();
    this.statusTimer = timer(time)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (iftrue.apply(this)) dosome.apply(this);
      });
  }

  /**创建最终等待ws响应的超时 */
  buildFinallyTimer() {
    this.showLoading = false;
    this.buildStatusTimer(this.loadingTimeOut, this.isOnSend, () => {
      this.showLoading = true;
      this.buildStatusTimer(this.sendtMsgTimeOut, this.isOnSend, () => {
        this.data.setStatus(0, 'sendTimeout');
      });
    });
  }

  /**创建等待上传响应的超时 */
  buildUploadTimer() {
    this.showLoading = false;
    this.buildStatusTimer(this.loadingTimeOut, this.isWaitUpload, () => {
      this.showLoading = true;
      this.buildStatusTimer(this.uploadResponse, this.isWaitUpload, () => {
        this.clean();
        this.data.setStatus(0, 'uploadResponseTimeout');
      });
    });
  }

  /**
   * 构建显示内容
   *
   * @param asset 如果传入,会更新
   * @param content 如果传入,会更新
   */
  buildContents(asset?: ChatMsgAsset[], content?: string) {
    const opts = this.chatService.imgAcceptOpt.map(x => ({
      type: x.name,
      msgType: x.msgType,
    }));
    if (asset) this.data.setAsset(asset);
    if (content) this.data.setContent(content);
    if (this.data.msgType === 0) {
      this.contents = [{ msgType: 0, content: this.data.content }];
    } else {
      this.contents = this.data.content
        .split(new RegExp(SPLIT_MIX_REGEXP, 'g'))
        .filter(x => x !== '')
        .map(t => {
          if (new RegExp(MATCH_MIX_REGEXP).test(t)) {
            const id = t.slice(2, -2);
            const assetItem =
              this.data.asset.find(x => String(x.fId) === id) ??
              this.data.asset.find(x => String(x.fId) === this.mediaFId) ??
              this.data.asset[0];
            const msgType = opts.find(x => x.type === (assetItem?.type ?? '').toLowerCase())?.msgType ?? 0;
            return { msgType: msgType, content: t, assetid: String(assetItem?.fId ?? '') };
          } else {
            return { msgType: 0, content: t };
          }
        });
    }
  }

  /**重发当前消息 */
  clickReSend() {
    // 如果不是失败状态，中止防止出错
    if (this.data.status !== 0) return;
    // 先改变状态，防止重复点击
    this.data.setStatus(undefined);
    // 重置
    this.showLoading = false;
    this.showProgress = false;
    this.data.setProgress(0);
    // 触发列表更新和重发
    this.chatService.updataMessagesListByReSend(this.data.seq);
  }

  viewer?: MatDialogRef<unknown>;

  checkView(template: TemplateRef<unknown>, asset: ChatMsgAsset) {
    this.viewer = this.popup.open(template, {
      disableClose: false,
      data: asset,
      isFull: true,
      panelClass: 'chat-media-view-contaienr',
    });
  }

  checkOpen(asset: ChatMsgAsset) {
    switch ((asset.type ?? '').toLowerCase()) {
      case 'pdf':
        window.open(asset.url || asset.localData?.dataUrl, 'chat-file-win');
        break;
      default:
        break;
    }
  }

  clean() {
    this.statusTimer?.unsubscribe();
    this.upload$?.unsubscribe();
  }

  /**显示提示 */
  showTips(reason?: FailReason) {
    switch (reason) {
      case 'sendTooFast':
      case 'uploadTooFast':
        this.toast.show({ message: this.localeService.getValue('im_frequency_limit'), type: 'fail', title: '' });
        break;
      case 'riskFile':
        this.toast.show({ message: this.localeService.getValue('upload_risk_tips'), type: 'fail', title: '' });
        break;
      default:
        break;
    }
  }

  /**中断检查 */
  interruptCheck(res?: ResponseData<{ fid: string }> | null): string | undefined {
    switch (res?.code) {
      case '0':
        return res?.data?.fid;
      case 'oa_im_3217':
        this.clean();
        this.data.setStatus(0, 'uploadTooFast');
        return undefined;
      case 'oa_im_3218':
        this.clean();
        this.data.setStatus(0, 'riskFile');
        return undefined;
      default:
        this.clean();
        this.data.setStatus(0, 'keyDataInvalid');
        return undefined;
    }
  }

  ngOnDestroy() {
    this.viewer?.close();
  }
}
