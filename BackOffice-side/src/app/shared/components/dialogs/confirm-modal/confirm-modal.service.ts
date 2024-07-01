import { Injectable } from '@angular/core';
import { MatModal, MatModalConfig, MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { ConfirmModalComponent } from 'src/app/shared/components/dialogs/confirm-modal/confirm-modal.component';
import { LangParams } from 'src/app/shared/interfaces/common.interface';

@Injectable()
export class ConfirmModalService {
  constructor(private modal: MatModal) {}

  open<D = any>(
    componentConfig:
      | {
          title?: string;
          titleLang?: string;
          msg?: string;
          msgLang?: string;
          msgArgs?: LangParams;
          type?: string;
          dismissShow?: boolean;
          confirmShow?: boolean;
        }
      | string,
    modalConfig?: MatModalConfig<D>
  ): MatModalRef<ConfirmModalComponent, boolean> {
    const modal = this.modal.open(ConfirmModalComponent, { width: '500px', ...modalConfig });

    if (typeof componentConfig === 'string') {
      modal.componentInstance.msgLang = componentConfig;
    } else {
      modal.componentInstance.title = componentConfig.title;
      modal.componentInstance.titleLang = componentConfig.titleLang;
      modal.componentInstance.msg = componentConfig.msg;
      modal.componentInstance.msgLang = componentConfig.msgLang;
      modal.componentInstance.msgArgs = componentConfig.msgArgs;
      modal.componentInstance.type = componentConfig.type ?? 'danger';
      modal.componentInstance.dismissShow = componentConfig.dismissShow ?? true;
      modal.componentInstance.confirmShow = componentConfig.confirmShow ?? true;
    }

    return modal;
  }
}
