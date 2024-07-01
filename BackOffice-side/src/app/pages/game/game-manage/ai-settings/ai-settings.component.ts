import { cloneDeep } from 'lodash';
import { Component, Input, OnInit } from '@angular/core';
import { zip } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { GameLabelApi } from 'src/app/shared/api/game-label.api';
import { MatModal, MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { SelectLabelComponent } from '../select-label/select-label.component';
import { SelectApi } from 'src/app/shared/api/select.api';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { HostPipe } from 'src/app/shared/pipes/common.pipe';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { NgIf, NgFor } from '@angular/common';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';

@Component({
  selector: 'app-ai-settings',
  templateUrl: './ai-settings.component.html',
  styleUrls: ['./ai-settings.component.scss'],
  standalone: true,
  imports: [
    ModalTitleComponent,
    LoadingDirective,
    NgIf,
    NgFor,
    FormRowComponent,
    AngularSvgIconModule,
    EmptyComponent,
    HostPipe,
    LangPipe,
  ],
})
export class AiSettingsComponent implements OnInit {
  constructor(
    public modal: MatModalRef<AiSettingsComponent, boolean>,
    private gameLabelApi: GameLabelApi,
    private modalService: MatModal,
    private appService: AppService,
    private gameSelectApi: SelectApi
  ) {}

  @Input() tenantId: string;

  isLoading = false;

  labelList: any[] = [];
  providerList: any[] = [];
  selectLabelList: any[] = [];

  curTabValue: any = 'Popular';
  list: any[] = [];

  ngOnInit() {
    this.isLoading = true;
    zip(
      this.gameLabelApi.getList(this.tenantId),
      this.gameSelectApi.getCategorySelect(this.tenantId, ['Online']),
      this.gameLabelApi.getenableaisortdata(this.tenantId)
    ).subscribe(([labelList, providerList, list]) => {
      this.isLoading = false;
      this.labelList = labelList || [];
      if (Array.isArray(providerList)) {
        this.providerList = providerList
          .map((v) => v.providers)
          .flat(Infinity)
          .filter((e) => e);
      }
      this.list = list || [];
    });
  }

  openSelectLabelPopup(curList: any[], index: number, key: string) {
    const modalRef = this.modalService.open(SelectLabelComponent, {
      width: '800px',
      disableClose: true,
    });
    modalRef.componentInstance['selectType'] = key === 'labelList' ? 'gameLabel' : 'gameProvider';
    modalRef.componentInstance['labelProviderList'] = this[key];
    modalRef.componentInstance['selectList'] = curList || [];
    modalRef.componentInstance.selectConfirm.subscribe((selectList) => {
      this.list[index][key] = selectList || [];
    });
    modalRef.result.then(() => {}).catch(() => {});
  }

  confirm() {
    const list: any[] = cloneDeep(this.list);
    list.forEach((v, i) => {
      list[i].labelList = (v?.labelList || []).map((v) => v?.id);
      list[i].providerList = (v?.providerList || []).map((v) => v?.id);
    });

    const params = {
      tenantId: +this.tenantId,
      list,
    };
    this.appService.isContentLoadingSubject.next(true);
    this.gameLabelApi.updateaisortsetting(params).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      if (res === true) this.modal.close(true);
      this.appService.toastOpera(res === true);
    });
  }
}
