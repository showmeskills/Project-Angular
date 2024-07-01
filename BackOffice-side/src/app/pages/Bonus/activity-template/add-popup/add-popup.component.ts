import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { AppService } from 'src/app/app.service';
import { cloneDeep } from 'lodash';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { Country } from 'src/app/shared/interfaces/select.interface';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { HostPipe } from 'src/app/shared/pipes/common.pipe';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { IconCountryComponent } from 'src/app/shared/components/icon/icon.directive';
import { FormsModule } from '@angular/forms';
import { SelectChildrenDirective, SelectGroupDirective } from 'src/app/shared/directive/select.directive';
import { NgIf, NgFor } from '@angular/common';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';

@Component({
  selector: 'app-add-popup',
  templateUrl: './add-popup.component.html',
  styleUrls: ['./add-popup.component.scss'],
  standalone: true,
  imports: [
    ModalTitleComponent,
    NgIf,
    NgFor,
    SelectChildrenDirective,
    SelectGroupDirective,
    FormsModule,
    IconCountryComponent,
    ModalFooterComponent,
    HostPipe,
    LangPipe,
  ],
})
export class AddPopupComponent implements OnInit {
  constructor(
    public modal: MatModalRef<AddPopupComponent, boolean>,
    private appService: AppService,
    public langService: LangService
  ) {}

  @Input() public type: any = '';
  @Input() public list: any[] = [];
  @Input() public selectedList: any[] = [];
  @Output() confirm = new EventEmitter<Country[]>();

  isLoading = false;

  countryList: any[] = [];
  currencyList: any[] = [];

  get isArea() {
    return this.type === 'area' ? true : false;
  }

  ngOnInit() {
    const data = cloneDeep(this.list);
    if (this.isArea) {
      this.countryList = data;
      this.countryList
        .map((v) => v.countries)
        .flat(Infinity)
        .forEach((a) => {
          this.selectedList.forEach((b) => {
            if (a.countryEnName === b.countryEnName) a['checked'] = true;
          });
        });
    } else {
      data.forEach((a) => {
        this.selectedList.forEach((b) => {
          if (a.code === b) a['checked'] = true;
        });
      });
      this.currencyList = [
        { name: '法币', list: data.filter((v) => !v.isDigital) },
        { name: '加密货币', list: data.filter((v) => v.isDigital) },
      ];
    }
  }

  onConfirm() {
    const selectedList: any = [];
    if (this.isArea) {
      this.countryList.forEach((v) => {
        selectedList.push(...v.countries.filter((e) => e['checked']));
      });
    } else {
      this.currencyList.forEach((v) => {
        selectedList.push(...v.list.filter((e) => e['checked']).map((v) => v.code));
      });
    }

    this.confirm.emit(selectedList);
    this.modal.close(true);
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }
}
