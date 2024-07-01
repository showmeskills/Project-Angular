import { Component, Inject, OnInit } from '@angular/core';
import { MAT_MODAL_DATA, MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';

@Component({
  selector: 'app-select-provider',
  templateUrl: './select-provider.component.html',
  styleUrls: ['./select-provider.component.scss'],
  standalone: true,
  imports: [AngularSvgIconModule, FormsModule, NgFor, NgIf, LangPipe],
})
export class SelectProviderComponent implements OnInit {
  constructor(
    @Inject(MAT_MODAL_DATA) public data: any,
    public modal: MatModalRef<SelectProviderComponent>
  ) {}

  select: any[] = [];

  kw = '';

  get list() {
    return this.data.providerList;
  }

  get isSearchEmpty() {
    /** 是否搜索结果为空 */
    return this.kw && !this.list.some((e) => this.hasSearchKW(e));
  }

  /** 双向绑定select - 用于直接使用在页面情况*/
  onConfirm(item) {
    this.data.providerList.forEach((e) => (e['checked'] = false)); // 只选中一个
    item.checked = true;
    this.select = item;
    this.modal.close(this.select);
  }

  /** 是否含有关键词*/
  hasSearchKW(item) {
    return this.kw
      ? item['name']?.toLowerCase().includes(this.kw?.toLocaleLowerCase()) ||
          item['providerCatId']?.toLowerCase().includes(this.kw?.toLocaleLowerCase())
      : true;
  }

  ngOnInit(): void {}
}
