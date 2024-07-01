import { Component, Input, OnInit } from '@angular/core';
import { Currency } from 'src/app/shared/interfaces/currency';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { IconSrcDirective } from 'src/app/shared/components/icon/icon.directive';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';

@Component({
  selector: 'select-currency',
  templateUrl: './select-currency.component.html',
  styleUrls: ['./select-currency.component.scss'],
  standalone: true,
  imports: [AngularSvgIconModule, FormsModule, NgFor, IconSrcDirective, NgIf, LangPipe],
})
export class SelectCurrencyComponent implements OnInit {
  constructor(public modal: MatModalRef<any>) {}

  @Input('data') propList: any[] = []; // 数据列表

  select: any[] = [];

  kw = '';
  innerList: Currency[] = [];

  get list() {
    return this.innerList;
  }

  get isSearchEmpty() {
    // 是否搜索结果为空
    return this.kw && !this.list.some((e) => this.hasSearchKW(e));
  }

  onConfirm(): void {
    this.modal.close(this.select);
  }

  // 计算需要渲染的列表
  update(list: Currency[], select?: any[]) {
    if (select) {
      this.select = select;
    }

    this.innerList = list.map((e) => ({
      ...e,
      checked: this.getChecked(e['code']),
    }));
  }

  // 更新选中状态
  updateState() {
    this.innerList.forEach((e) => {
      e['checked'] = this.getChecked(e['code']);
    });
  }

  // 获取选中值
  getChecked(val) {
    return this.select.includes(val);
  }

  // 双向绑定select - 用于直接使用在页面情况
  onChange(item) {
    const value = item['code'];

    this.innerList.forEach((e) => (e['checked'] = false)); // 只选中一个
    item.checked = true;

    this.select = [value];
  }

  // 是否含有关键词
  hasSearchKW(item) {
    return this.kw
      ? item['description']?.toLowerCase().includes(this.kw?.toLocaleLowerCase()) ||
          item['code']?.toLowerCase().includes(this.kw?.toLocaleLowerCase())
      : true;
  }

  ngOnInit(): void {}
}
