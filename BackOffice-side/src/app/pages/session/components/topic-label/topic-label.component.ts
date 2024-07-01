import { Component, inject, Input } from '@angular/core';
import { TopicLabelBase } from 'src/app/shared/interfaces/session';
import { LangService } from 'src/app/shared/components/lang/lang.service';

@Component({
  selector: 'topic-label,[topic-label]',
  standalone: true,
  imports: [],
  templateUrl: './topic-label.component.html',
  styleUrl: './topic-label.component.scss',
  host: {
    class: 'topic-label',
    '[class]': '[className, active ? "active" : "", pointer ? "cursor-pointer" : ""]',
  },
})
export class TopicLabelComponent {
  lang = inject(LangService);

  @Input({ required: true }) data: TopicLabelBase;
  @Input() active: boolean;
  @Input() pointer = true;

  get label() {
    return (this.lang.isLocal ? this.data?.nameCn : this.data?.nameEn) || '';
  }

  get className() {
    if (this.data?.deleteFlag) return 'topic-label-del';
    return `topic-label-${this.data?.label}`;
  }
}
