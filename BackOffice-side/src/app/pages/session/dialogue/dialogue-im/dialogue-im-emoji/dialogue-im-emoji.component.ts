import { Component, EventEmitter, inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import emojiJSON from './dialogue-im-emoji.json';
import { LangService } from 'src/app/shared/components/lang/lang.service';

@Component({
  selector: 'im-emoji',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialogue-im-emoji.component.html',
  styleUrls: ['./dialogue-im-emoji.component.scss'],
  host: {
    class: 'custom-scroll-y',
  },
})
export class DialogueImEmojiComponent {
  lang = inject(LangService);

  @Output() selectEmoji = new EventEmitter<string>();

  emojis = emojiJSON;

  onEmojiSelect(emoji: (typeof this.emojis)[0]) {
    this.selectEmoji.emit(emoji.preview);
  }
}
