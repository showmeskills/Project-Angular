import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';

@Component({
  selector: 'vip-records-default',
  standalone: true,
  imports: [CommonModule, EmptyComponent, LangPipe],
  template: `
    <div class="bg-fff rounded-2">
      <empty [text]="'system.export.selectReport' | lang"></empty>
    </div>
  `,
  styles: [],
})
export class VipRecordsDefaultComponent {}
