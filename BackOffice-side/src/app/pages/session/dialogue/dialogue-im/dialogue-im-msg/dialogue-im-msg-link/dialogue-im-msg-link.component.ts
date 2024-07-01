import { Component, Input } from '@angular/core';
import { SessionChatItem } from 'src/app/shared/interfaces/session';
import { IMMsgComponent } from 'src/app/pages/session/dialogue/dialogue-im/dialogue-im-msg/dialogue-im-msg.service';

@Component({
  selector: 'dialogue-im-msg-link',
  standalone: true,
  imports: [],
  template: `<a [href]="data?.content" target="_blank" class="msg-link">{{ data?.content }}</a>`,
  styles: `
    :host {
      display: inline;
    }
  `,
})
export class DialogueImMsgLinkComponent implements IMMsgComponent {
  @Input() data: SessionChatItem;
}
