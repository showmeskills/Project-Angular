import { Component, inject, Input } from '@angular/core';
import { IMFileFile, SessionChatItem } from 'src/app/shared/interfaces/session';
import { IMMsgComponent } from 'src/app/pages/session/dialogue/dialogue-im/dialogue-im-msg/dialogue-im-msg.service';
import { NgIf, NgOptimizedImage } from '@angular/common';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'dialogue-im-msg-pdf',
  standalone: true,
  imports: [NgOptimizedImage, NgIf],
  template: `
    <div class="im-msg-pdf-wrap" [class.cursor-pointer]="isLoading && asset?.url" (click)="onOpen()">
      <img
        class="vam mr-2 loading-anim"
        *ngIf="!isLoading"
        src="assets/images/svg/loading.svg"
        width="20"
        height="20"
      />
      <img class="vam mr-2" *ngIf="isLoading" src="assets/images/svg/im/pdf.svg" width="20" height="20" />
      <span class="vam">{{ asset?.name || '' }}</span>
    </div>
  `,
  styles: `
    :host {
      display: block;

      .im-msg-pdf-wrap {
        display: inline-block;
      }

      .loading-anim {
        animation: rotate 3s linear infinite;
      }

      @keyframes rotate {
        from {
          transform: rotateZ(0deg);
        }
        to {
          transform: rotateZ(360deg);
        }
      }
    }
  `,
})
export class DialogueImMsgPdfComponent implements IMMsgComponent {
  appService = inject(AppService);

  @Input() data: SessionChatItem;
  @Input() asset?: IMFileFile;

  get isLoading() {
    return this.asset?.isLoaded;
  }

  /**
   * 打开文件
   * @Desc 注意 window.open 不支持异步，会浏览器拦截
   */
  onOpen() {
    if (!this.isLoading) return;
    if (!this.asset?.url) return this.appService.showToastSubject.next({ msgLang: 'common.emptyText' });

    window.open(this.asset.url);
  }
}
