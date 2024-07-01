import { Component, Inject, OnInit } from '@angular/core';
import { MatModalRef, MAT_MODAL_DATA, MatModal } from 'src/app/shared/components/dialogs/modal';
import { AppService } from 'src/app/app.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';

@Component({
  selector: 'app-game-search',
  templateUrl: './game-search.component.html',
  styleUrls: ['./game-search.component.scss'],
  standalone: true,
  imports: [AngularSvgIconModule, FormsModule, NgFor, NgIf, LangPipe],
})
export class GameSearchComponent implements OnInit {
  constructor(
    @Inject(MAT_MODAL_DATA) public data: any,
    public modal: MatModalRef<GameSearchComponent>,
    private modalService: MatModal,
    private appService: AppService // private subHeaderService: SubHeaderService
  ) {}

  select: any[] = [];

  kw = '';

  get list() {
    return this.data.list;
  }

  get isSearchEmpty() {
    // 是否搜索结果为空
    return this.kw && !this.list.some((e) => this.hasSearchKW(e));
  }

  // 双向绑定select - 用于直接使用在页面情况
  onChange(item) {
    this.data.list.forEach((e) => (e['checked'] = false)); // 只选中一个
    item.checked = true;
    this.select = item;
    this.modal.close(this.select);
  }

  // 是否含有关键词
  hasSearchKW(item) {
    return this.kw
      ? item['searchName']?.toLowerCase().includes(this.kw?.toLocaleLowerCase()) ||
          item['searchDeatil']?.toLowerCase().includes(this.kw?.toLocaleLowerCase())
      : true;
  }

  ngOnInit(): void {}
}
