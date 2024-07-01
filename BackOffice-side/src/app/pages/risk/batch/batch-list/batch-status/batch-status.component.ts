import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeDescription } from 'src/app/shared/interfaces/base.interface';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LabelComponent } from 'src/app/shared/components/label/label.component';

@Component({
  selector: 'batch-status, [batch-status]',
  standalone: true,
  imports: [CommonModule, LabelComponent],
  templateUrl: './batch-status.component.html',
  styleUrls: ['./batch-status.component.scss'],
})
export class BatchStatusComponent {
  @Input({ required: true }) status: string | null = null;
  @Input({ required: true }) list: CodeDescription[] = [];

  constructor(private lang: LangService) {}

  getStatus(code: string | null) {
    if (!code) return '';

    const item = this.list.find((e) => e.code === code);
    return this.lang.isLocal ? item?.description : item?.code;
  }
}
