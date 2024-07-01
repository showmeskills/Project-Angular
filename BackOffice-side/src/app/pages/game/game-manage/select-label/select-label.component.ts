import { cloneDeep } from 'lodash';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { GameLabelApi } from 'src/app/shared/api/game-label.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { SelectApi } from 'src/app/shared/api/select.api';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { HostPipe } from 'src/app/shared/pipes/common.pipe';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { AngularSvgIconModule } from 'angular-svg-icon';

@Component({
  selector: 'app-select-label',
  templateUrl: './select-label.component.html',
  styleUrls: ['./select-label.component.scss'],
  standalone: true,
  imports: [
    AngularSvgIconModule,
    FormWrapComponent,
    ModalTitleComponent,
    LoadingDirective,
    NgFor,
    FormsModule,
    NgIf,
    EmptyComponent,
    HostPipe,
    LangPipe,
  ],
})
export class SelectLabelComponent implements OnInit {
  constructor(
    public modal: MatModalRef<SelectLabelComponent, boolean>,
    private gameLabelApi: GameLabelApi,
    public subHeader: SubHeaderService,
    private gameSelectApi: SelectApi
  ) {}

  @Input() tenantId;

  /** 类型：1.游戏标签（gameLabel）2.游戏厂商（gameProvider）*/
  @Input() selectType = 'gameLabel';

  @Input() labelProviderList: any[] = [];

  @Input() selectList: any[] = [];

  @Output() selectConfirm = new EventEmitter();

  isLoading = false;

  list: any[] = [];
  allList: any[] = [];
  inpuSreachName = '';

  get title() {
    switch (this.selectType) {
      case 'gameLabel':
        return 'member.activity.prizeCommon.gameLabelSelection';
      case 'gameProvider':
        return 'member.activity.prizeCommon.gameProviderSelection';
      default:
        return 'common.unknown';
    }
  }

  ngOnInit() {
    if (this.labelProviderList.length > 0) {
      this.list = cloneDeep(this.labelProviderList);
      this.update();
    } else {
      this.isLoading = true;
      if (this.selectType === 'gameLabel') {
        this.gameLabelApi.getList(this.subHeader.merchantCurrentId || this.tenantId).subscribe((res) => {
          this.isLoading = false;
          this.list = res || [];
          this.update();
        });
      } else {
        this.gameSelectApi
          .getCategorySelect(this.subHeader.merchantCurrentId || this.tenantId, ['Online'])
          .subscribe((res) => {
            this.isLoading = false;
            if (Array.isArray(res)) {
              this.list = res
                .map((v) => v.providers)
                .flat(Infinity)
                .filter((e) => e);
              this.update();
            }
          });
      }
    }
    this.allList = [...this.list];
  }

  update() {
    if (!this.selectList.length || !this.list.length) return;
    this.list.forEach((a) => {
      a.checked = false;
      this.selectList.forEach((b) => {
        if (a?.id === b?.id) a.checked = true;
      });
    });
  }

  confirm() {
    this.selectConfirm.emit(this.list.filter((v) => v?.checked));
    this.modal.close(true);
  }

  serachChange() {
    this.allList = this.list.filter((v) =>
      (this.selectType == 'gameLabel' ? v.name : v.providerName)
        .toLowerCase()
        .includes(this.inpuSreachName.toLowerCase())
    );
  }
}
