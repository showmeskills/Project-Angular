import { AfterViewInit, Component, DestroyRef, ElementRef, OnInit, ViewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ChatService } from '../../shared/service/chat.service';

import { Subject } from 'rxjs';
import { ScrollbarComponent } from 'src/app/shared/components/scrollbar/scrollbar.component';
import { ChatMsgAsset } from 'src/app/shared/interfaces/chat.interface';
import { GnService } from 'src/app/shared/service/global-notification.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, AfterViewInit {
  constructor(
    public chatService: ChatService,
    public gnService: GnService,
    private destroyRef: DestroyRef,
    private layout: LayoutService,
    private toast: ToastService,
    private localeService: LocaleService,
  ) {}

  // prettier-ignore
  // emoji表情数组
  emojis = ['😀','😆','🤣','🙂','😭','😉','😍','😋','🤗','🤔','🤐','😑','🙄','😬','😴','🤢','🤧','😵','😖','😢','😂','🤥','☹️','😠','😏','😒'];

  /**是否是 H5 */
  isH5 = toSignal(this.layout.isH5$);

  /**长连接是否活着（用于显示loading） */
  isAlive = toSignal(this.chatService.wsAlive$);

  /**输入框的值 */
  inputValue: string = '';
  /**输入中 */
  isComposing = false;
  /**输入框触发滚动 */
  inputScroll = false;
  /**输入框最大输入字符数 */
  maxInput = 5000;

  /**是否可以显示列表 */
  ready = false;

  /**是否在顶部 */
  get isTop() {
    const el = this.scrollbar?.scrollBox?.nativeElement as HTMLElement;
    return el ? el.scrollTop === 0 : false;
  }
  /**是否在底部 */
  get isBottom() {
    const el = this.scrollbar?.scrollBox?.nativeElement as HTMLElement;
    return el ? el.scrollTop + el.offsetHeight === el.scrollHeight : false;
  }

  /**输入框 */
  @ViewChild('inputDiv') inputEl?: ElementRef<HTMLElement>;
  /**滚动组件 */
  @ViewChild('scrollbar') scrollbar?: ScrollbarComponent;

  ngOnInit() {
    // 滚动到某条消息
    this.chatService.scrollToIndex$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(v => {
      this.scrollTo(v);
    });
    // 订阅禁言状态
    this.chatService.muteState$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(v => {
      this.changeMute(v);
    });
    this.chatService.readAll();
  }

  ngAfterViewInit() {
    setTimeout(
      () => {
        if (this.chatService.lastScrollIndex !== undefined) {
          // 回到之前的滚动位置
          this.scrollTo(this.chatService.lastScrollIndex, () => (this.ready = true));
        } else {
          // 首次滚动到底部
          this.scrollTo('bottom', () => (this.ready = true));
        }
      },
      this.isH5() ? 300 : 50,
    );
  }

  getHistoryBefore() {
    const lastTime = this.chatService.messages[0]?.createTime || undefined;
    this.chatService.getHistory(lastTime);
  }

  emojiExpandStatus = false;
  emojiEx$: Subject<boolean> = new Subject();
  selectExpandStatus = false;
  selectEx$: Subject<boolean> = new Subject();

  checkHide(checkh5: boolean = false) {
    if ((checkh5 && this.isH5()) || !checkh5) {
      if (this.emojiExpandStatus) {
        this.emojiEx$.next(false);
      }
      if (this.selectExpandStatus) {
        this.selectEx$.next(false);
      }
    }
  }

  expandChange(type: string, state: boolean) {
    switch (type) {
      case 'sel':
        if (state && this.emojiExpandStatus) this.emojiEx$.next(false);
        this.selectExpandStatus = state;
        break;
      case 'emj':
        if (state && this.selectExpandStatus) this.selectEx$.next(false);
        this.emojiExpandStatus = state;
        break;
      default:
        break;
    }
  }

  /**滚动到 */
  scrollTo(v: number | 'bottom' | 'top', cb: () => void = () => {}) {
    setTimeout(() => {
      v === 'top'
        ? this.scrollbar?.scrollToTop()
        : v === 'bottom'
          ? this.scrollbar?.scrollToBottom()
          : this.scrollbar?.scrollTo(v);
      cb();
    }, 50);
  }

  /**粘贴东西 */
  onPaste(e: ClipboardEvent) {
    e.preventDefault();
    const clipboardData = e.clipboardData;
    if (clipboardData) {
      const text = clipboardData.getData('text/plain');
      if (text) {
        // 过滤换行、复数的空格
        const rtxt = text.replace(/\n|\r/g, '').replace(/\s+/g, ' ');
        this.insertText(rtxt);
      }
    }
  }

  /**输入东西 */
  onInput() {
    const target = this.inputEl?.nativeElement as HTMLDivElement;
    this.inputValue = target.innerText;
    this.checkInputScroll(target);
  }

  /**检查滚动 */
  checkInputScroll(e: HTMLDivElement) {
    this.inputScroll = e.scrollHeight > e.clientHeight;
  }

  /**在输入框光标位置插入内容 */
  insertText(v: string) {
    if (!this.inputEl) return;
    const focusMode = !this.isH5();
    const sel = document.getSelection() as Selection;
    const node = sel.focusNode;
    let range = sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
    if (range && node && this.inputEl.nativeElement.contains(node)) {
      range.deleteContents();
    } else {
      range = document.createRange();
      range.selectNodeContents(this.inputEl.nativeElement);
      if (focusMode) sel.removeAllRanges();
      sel.addRange(range);
      range.collapse(false);
    }
    const text = document.createTextNode('');
    text.textContent = v;
    range.insertNode(text);
    range.collapse(false);
    this.onInput();
    if (focusMode) this.inputEl.nativeElement.focus();
  }

  /**发送文字消息 */
  sendText(text: string) {
    if (this.chatService.muteState$.value) return;
    const createTime = Date.now();
    const seq = `${environment.common.tenant}-${Math.random().toString().slice(-3)}-${createTime}`;
    this.chatService.send({
      seq: seq,
      createTime: createTime,
      msgType: 0,
      content: text,
    });
    // 清空
    if (this.inputEl) this.inputEl.nativeElement.innerText = '';
    this.inputValue = '';
    this.inputScroll = false;
  }

  /**发送媒体消息 */
  sendMedia(assetInfo: ChatMsgAsset, msgType: number) {
    if (this.chatService.muteState$.value) return;
    const createTime = Date.now();
    const seq = `${environment.common.tenant}-${Math.random().toString().slice(-3)}-${createTime}`;
    this.chatService.send({
      seq: seq,
      createTime: createTime,
      msgType: msgType,
      content: `#{${assetInfo.fId}}#`,
      asset: [{ ...assetInfo }],
    });
    this.selectEx$.next(false);
  }

  /**检查是否可以发送 */
  checkToSend() {
    if (!this.inputValue) return;
    const text = this.inputValue.trim();
    if (text.length < 1) return;
    if (text.length > this.maxInput) {
      this.toast.show({
        message: this.localeService.getValue('chat_msg_tolong', this.maxInput),
        type: 'fail',
        title: '',
      });
      return;
    }
    this.sendText(text);
  }

  async checkUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    if (!target.value) return;
    const file = target.files && target.files[0];
    if (!file) return;
    const fileType = file.type.toLowerCase();
    const opt = this.chatService.imgAcceptOpt.find(x => x.type === fileType);
    // 文件格式错误
    if (!opt) {
      this.toast.show({ message: this.localeService.getValue('unsupp_file'), type: 'fail', title: '', duration: 3000 });
      target.value = '';
      return;
    }
    // 文件超过大小
    if (file.size > opt.size) {
      this.toast.show({
        message: this.localeService.getValue('up_file_lim') + ' ' + opt.size / 1024 / 1024 + ' Mb',
        type: 'fail',
        title: '',
        duration: 3000,
      });
      target.value = '';
      return;
    }

    const fileInfo: ChatMsgAsset = {
      fId: '-1',
      type: opt.name,
      size: file.size,
      name: file.name,
    };

    switch (opt.msgType) {
      case 1: {
        // 图片
        const imgInfo = await this.getImgInfo(file);
        this.sendMedia(
          {
            ...fileInfo,
            width: imgInfo.width,
            height: imgInfo.height,
            localData: imgInfo.localData,
          },
          opt.msgType,
        );
        break;
      }
      case 3: {
        // 视频
        const videoInfo = await this.getVideoInfo(file);
        this.sendMedia(
          {
            ...fileInfo,
            width: videoInfo.width,
            height: videoInfo.height,
            duration: videoInfo.duration,
            localData: videoInfo.localData,
          },
          opt.msgType,
        );
        break;
      }
      case 7: {
        // pdf
        const pdfInfo = await this.getPdfInfo(file);
        this.sendMedia({ ...fileInfo, localData: pdfInfo.localData }, opt.msgType);
        break;
      }
      default:
        break;
    }
    target.value = '';
  }

  /**
   * 获取图片信息
   *
   * @param file 图片文件
   */
  private async getImgInfo(file: File): Promise<ChatMsgAsset> {
    const promise = new Promise<ChatMsgAsset>(resolve => {
      const img = new Image();
      const src = URL.createObjectURL(file);
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          localData: {
            file: file,
            dataUrl: src,
          },
        });
      };
      img.src = src;
    });
    return promise;
  }

  /**
   * 获取视频信息
   *
   * @param file 视频文件
   */
  private async getVideoInfo(file: File): Promise<ChatMsgAsset> {
    const promise = new Promise<ChatMsgAsset>(resolve => {
      const video = document.createElement('video');
      const src = URL.createObjectURL(file);
      video.setAttribute('preload', 'auto');
      video.onloadedmetadata = async () => {
        const { videoWidth, videoHeight, duration } = video;
        const canvas = document.createElement('canvas');
        canvas.width = videoWidth;
        canvas.height = videoHeight;
        canvas.getContext('2d')?.drawImage(video, 0, 0, videoWidth, videoHeight);
        const thumb = await new Promise<File>(resolve => {
          canvas.toBlob(blob => resolve(new File([blob as Blob], 'thumb.jpg')), 'image/jpg');
        });
        resolve({
          width: videoWidth,
          height: videoHeight,
          duration: duration,
          localData: {
            file: file,
            thumbFile: thumb,
            dataUrl: src,
            thumbDataUrl: URL.createObjectURL(thumb),
          },
        });
      };
      video.onerror = () => {
        resolve({
          width: 0,
          height: 0,
          duration: 0,
          localData: {
            file: file,
          },
        });
      };
      video.src = src;
    });
    return promise;
  }

  /**
   * 获取文件信息
   *
   * @param file 文件
   */
  private async getPdfInfo(file: File): Promise<ChatMsgAsset> {
    const promise = new Promise<ChatMsgAsset>(resolve => {
      const src = URL.createObjectURL(file);
      resolve({
        localData: {
          file: file,
          dataUrl: src,
        },
      });
    });
    return promise;
  }

  enterToSend(e: Event) {
    e.preventDefault();
    this.checkToSend();
  }

  onScorllList(v: number) {
    this.chatService.lastScrollIndex = v;
    if (this.isBottom) {
      this.chatService.readAll();
    }
  }

  changeMute(v: boolean) {
    if (v) {
      // 禁言
      if (this.emojiExpandStatus) this.emojiEx$.next(false);
    } else {
      //解除禁言
    }
  }
}
