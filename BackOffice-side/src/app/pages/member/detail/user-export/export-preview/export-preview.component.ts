import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DismissCloseDirective,
  ModalFooterComponent,
} from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';

@Component({
  selector: 'export-preview',
  standalone: true,
  imports: [CommonModule, ModalFooterComponent, DismissCloseDirective, LangPipe, ModalTitleComponent, TimeFormatPipe],
  templateUrl: './export-preview.component.html',
  styleUrls: ['./export-preview.component.scss'],
})
export class ExportPreviewComponent implements OnInit {
  constructor(
    public modal: MatModalRef<ExportPreviewComponent>,
    public lang: LangService
  ) {}

  list: any[] = [];

  get keyList() {
    return Object.keys(this.list[0] || {});
  }

  ngOnInit(): void {}
}
