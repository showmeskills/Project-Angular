import { Component, Input } from '@angular/core';
import { SessionChatItem } from 'src/app/shared/interfaces/session';
import { IMMsgComponent } from 'src/app/pages/session/dialogue/dialogue-im/dialogue-im-msg/dialogue-im-msg.service';

@Component({
  selector: 'dialogue-im-msg-text',
  standalone: true,
  imports: [],
  template: `{{ data?.content || '' }}`,
  styles: `
    :host {
      word-break: break-all;
      white-space: pre-line;
      display: inline;
      text-wrap: wrap;
      line-height: 24px;
    }
  `,
})
export class DialogueImMsgTextComponent implements IMMsgComponent {
  @Input() data: SessionChatItem;
}
