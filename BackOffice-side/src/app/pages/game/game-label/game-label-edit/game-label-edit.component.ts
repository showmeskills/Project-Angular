import { Component, Inject, OnInit } from '@angular/core';
import { MatModalRef, MAT_MODAL_DATA, MatModal } from 'src/app/shared/components/dialogs/modal';
import { AppService } from 'src/app/app.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { InputNumberDirective } from 'src/app/shared/directive/input.directive';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { NgIf, NgFor } from '@angular/common';
// import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
// import { GameLabelApi } from 'src/app/shared/api/game-label.api';
@Component({
  selector: 'app-game-label-edit',
  templateUrl: './game-label-edit.component.html',
  styleUrls: ['./game-label-edit.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    ModalTitleComponent,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    NgFor,
    MatOptionModule,
    InputNumberDirective,
    AngularSvgIconModule,
    NgbPopover,
    ModalFooterComponent,
    LangPipe,
  ],
})
export class GameLabelEditComponent implements OnInit {
  constructor(
    @Inject(MAT_MODAL_DATA) public data: any,
    public modal: MatModalRef<GameLabelEditComponent>,
    private modalService: MatModal,
    private appService: AppService // private subHeaderService: SubHeaderService
  ) {}

  list: any[] = [
    // { lang: 'game.provider.smartSort', name: '智能排序', value: 'ai' },
    { lang: 'game.provider.manualSort', name: '人工排序', value: 'proson' },
  ];

  //娱乐场是否能够点击
  disable = true;
  isPlayground = false; //是否开启娱乐场
  sortName = 'proson';
  webUrl = '';
  appUrl = '';
  multiLine = 1; //行数
  type = 'LabelPage';
  excludeList: any = [];
  ngOnInit(): void {
    this.isPlayground = this.data.item.isPlayground;
    this.excludeList = this.data.addLabelList.filter((item) => this.data.item.excludeLabels?.includes(item.id));
    this.type = this.data.item.config.redirectMethod;
    this.webUrl = this.data.item.config.redirectMethod === 'AssignUrl' ? this.data.item.config.assignUrl : '';
    this.appUrl = this.data.item.config.redirectMethod === 'AssignUrl' ? this.data.item.config.assignAppUrl : '';
    this.multiLine = this.data.item?.multiLine;
    if (this.data.isAll) {
      this.disable = false;
    }
    if (!this.data.isAll && this.isPlayground) {
      this.disable = false;
    }
  }

  onSubmit() {
    this.modal.close({
      excludeLabels: this.excludeList.map((v) => v.id),
      isPlayground: this.isPlayground,
      redirectMethod: this.type,
      assignUrl: this.type == 'AssignUrl' ? this.webUrl : '',
      assignAppUrl: this.type == 'AssignUrl' ? this.appUrl : '',
      multiLine: this.multiLine ? this.multiLine : 1,
    });
  }

  onAddLabelSubmit(c) {
    const list = this.data.addLabelList.filter((e) => e.checked);
    this.excludeList = [...this.excludeList, ...list];
    c();
  }

  onDelLabel(i) {
    const item = this.excludeList.splice(i, 1);
    const flag = this.data.addLabelList.some((e) => e.id === item[0].id);
    if (!flag) {
      this.data.addLabelList = [...this.data.addLabelList, ...item];
    }
    // this.data.addLabelList = [...this.data.addLabelList, ...this.excludeList.splice(i, 1)];
  }

  openAddLabelPopup(tpl) {
    this.data.addLabelList = this.data.addLabelList.filter(
      (item) => !this.excludeList.map((v) => v.id).includes(item.id)
    );
    this.data.addLabelList.forEach((item) => {
      item.checked = false;
    });
    this.modalService.open(tpl);
  }
}
