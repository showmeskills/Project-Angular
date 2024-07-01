import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangParams } from 'src/app/shared/interfaces/common.interface';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { ModalFooterComponent } from '../modal/modal-footer.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgIf } from '@angular/common';
import { ModalTitleComponent } from '../modal/modal-title.component';

@Component({
  selector: 'confirm-modal, [confirm-modal]',
  templateUrl: './confirm-modal.component.html',
  standalone: true,
  imports: [ModalTitleComponent, NgIf, AngularSvgIconModule, ModalFooterComponent, LangPipe],
})
export class ConfirmModalComponent implements OnInit {
  constructor(public modal: MatModalRef<ConfirmModalComponent>, private lang: LangService) {}

  @Input() title?: string;
  @Input() titleLang?: string;
  @Input() msgLang? = '';
  @Input() msgArgs?: LangParams = {};
  @Input() msg? = '';
  @Input() type?: string = 'danger';
  @Output() confirm = new EventEmitter<any>();
  @Output() dismiss = new EventEmitter<any>();

  ngOnInit(): void {}

  onConfirm() {
    this.modal.close(true);
    this.confirm.emit(true);
  }

  onClose() {
    this.modal.dismiss();
    this.dismiss.emit();
  }
}
