import { Component, Input, OnInit } from '@angular/core';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { NgIf, NgFor } from '@angular/common';
import { ProgressComponent } from 'src/app/shared/components/progress/progress.component';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';

@Component({
  selector: 'batch-upload',
  templateUrl: './batch-upload.component.html',
  styleUrls: ['./batch-upload.component.scss'],
  standalone: true,
  imports: [ModalTitleComponent, ProgressComponent, NgIf, NgFor, ModalFooterComponent, LangPipe],
})
export class BatchUploadComponent implements OnInit {
  constructor(public modal: MatModalRef<BatchUploadComponent>) {}

  @Input() type = 'image';
  @Input() total = 0;
  @Input() index = 0;
  @Input() failList: any[] = [];
  @Input() updateFailList: string[] = [];

  finished = false;

  get isFinish() {
    return this.total === this.index;
  }

  get isFile() {
    return this.type === 'file';
  }

  ngOnInit(): void {}

  finish() {
    this.index = this.total;
  }
}
