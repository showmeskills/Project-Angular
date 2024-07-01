import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { searchFilter } from 'src/app/shared/pipes/array.pipe';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';

@Component({
  selector: 'app-area-select',
  templateUrl: './area-select.component.html',
  styleUrls: ['./area-select.component.scss'],
  standalone: true,
  imports: [
    ModalTitleComponent,
    FormWrapComponent,
    AngularSvgIconModule,
    FormsModule,
    NgIf,
    NgFor,
    searchFilter,
    LangPipe,
  ],
})
export class AreaSelectComponent implements OnInit {
  constructor(public modal: MatModalRef<AreaSelectComponent>) {}

  @Input() data: any[] = []; // 国家区号全部信息
  @Output() confirm = new EventEmitter();

  areaSearch: any = ''; // 搜索国家名称
  countries: any = []; // 根据搜索显示的列表
  searchGroup: any = {};

  ngOnInit() {
    this.countries = this.data;
  }

  // onSearchInput() {
  //   if (this.areaSearch) {
  //     this.countries = this.countryFilter(this.data, this.areaSearch);
  //     return;
  //   }
  //   this.countries = this.data;
  // }

  // countryFilter(list: any[], searchText: any) {
  //   return list.find((item) => item.name.search(searchText) > -1)
  //     ? list.filter((item) => item.name.search(searchText) > -1)
  //     : list.filter((item) => item.areaCode.search(searchText) > -1);
  // }

  // onClear() {
  //   this.areaSearch = '';
  //   this.onSearchInput();
  // }

  onClear(key: string, el: HTMLInputElement) {
    el.value = '';
    el.focus();
    this.searchGroup[key] = '';
  }

  selectedArea(code: any) {
    this.confirm.emit(code);
    this.modal.close(true);
  }

  // 国旗class
  className(code: any) {
    // 后台返回的国家code，含有不符合CSS样式规则， 有空格，&，逗号，小数点等。
    return (
      'country-' +
      code
        .replace(/\(/g, '')
        .replace(/\)/g, '')
        .replace(/&/g, '_and_')
        .replace(/ /g, '_')
        .replace(/,/g, '')
        .replace(/\./g, '')
    );
  }
}
