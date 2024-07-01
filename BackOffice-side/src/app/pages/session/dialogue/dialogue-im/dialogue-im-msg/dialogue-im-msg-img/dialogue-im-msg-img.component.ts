import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { IMFileImg, SessionChatItem } from 'src/app/shared/interfaces/session';
import { IMMsgComponent } from 'src/app/pages/session/dialogue/dialogue-im/dialogue-im-msg/dialogue-im-msg.service';
import { NzImageDirective } from 'src/app/shared/components/image';
import { NgOptimizedImage } from '@angular/common';
import { SessionService } from 'src/app/pages/session/session.service';

@Component({
  selector: 'dialogue-im-msg-img',
  standalone: true,
  imports: [NzImageDirective, NgOptimizedImage],
  template: `<img
    [class.cursor-pointer]="!!asset?.url"
    alt=""
    [ngSrc]="asset?.url || ''"
    [width]="asset?.width"
    [height]="asset?.height"
    nz-image
    (load)="sessionService?._msgLoadChange.next(null)"
  />`,
  styles: `
    :host {
      display: block;
      margin-top: 5px;
      margin-bottom: 5px;

      &::ng-deep {
        img {
          max-width: 100%;
          max-height: 430px;
          object-fit: cover;
          min-width: 30px;
          min-height: 30px;
        }
      }
    }
  `,
})
export class DialogueImMsgImgComponent implements IMMsgComponent {
  sessionService = inject(SessionService, { optional: true });

  @Input() data: SessionChatItem;
  @Input() asset?: IMFileImg;

  @Output() loaded = new EventEmitter();

  // TODO 等有单独消息类型再做 当前会话消息所有图片的列表预览
  // getImgList() {
  //   return this.sessionService?._curSessionMsg.value?.filter((e) => e.type === 'image');
  // }
}
