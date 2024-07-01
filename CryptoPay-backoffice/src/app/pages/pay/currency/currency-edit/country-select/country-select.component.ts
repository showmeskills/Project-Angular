import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { SelectApi } from 'src/app/shared/api/select.api';
import { AppService } from 'src/app/app.service';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import {
  ModalFooterComponent,
  DismissCloseDirective,
} from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { MatListModule } from '@angular/material/list';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';

@Component({
  selector: 'country-select',
  templateUrl: './country-select.component.html',
  styleUrls: ['./country-select.component.scss'],
  standalone: true,
  imports: [
    ModalTitleComponent,
    MatExpansionModule,
    NgFor,
    NgIf,
    FormsModule,
    MatListModule,
    ModalFooterComponent,
    DismissCloseDirective,
    LangPipe,
  ],
})
export class CountrySelectComponent implements OnInit {
  constructor(
    private selectApi: SelectApi,
    private subHeaderService: SubHeaderService,
    private appService: AppService,
    public modal: MatModalRef<CountrySelectComponent>
  ) {}

  @Input() get countryList() {
    return this._countryList;
  }

  set countryList(v: any[]) {
    this._countryList = v;
    this.isPropList = true;
    this.setChecked();
  }

  _countryList: any[] = [];

  private;

  private _select: string[] = [];

  @Input() set select(v: string[]) {
    this._select = v;
    this.setChecked();
  }

  @Input() isPropList = false;

  @Output() selectChange = new EventEmitter<string[]>();

  /** lifeCycle */
  ngOnInit(): void {
    if (this.isPropList) return;
    this.appService.isContentLoadingSubject.next(true);
    this.selectApi.getCountry().subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      this.setList(res);
    });
  }

  /**
   * 是否半选状态
   */
  isIndeterminate(item: any): boolean {
    // TODO 容易影响性能，有时间优化成节点属性
    let hasChecked = item['countries'].some((v) => v['selected']);
    let isAll = item['countries'].every((v) => v['selected']);

    item['selected'] = hasChecked;
    return hasChecked && !isAll;
  }

  checkItem(item: any) {
    if (!item) return;

    if (item.disabled) return;
    const val = item['selected'];

    if (item.countries && item.countries.length) {
      item.countries.forEach((v) => {
        if (v.disabled) return;
        v['selected'] = val;
      });
    }
  }

  onSubmit() {
    const sel = this.countryList
      .filter((e) => e.selected)
      .map((e) => e.countries.filter((j) => j.selected).map((e) => e.countryCode))
      .flat();

    this.selectChange.emit(sel);
    this.modal.close();
  }

  setChecked() {
    this._select.forEach((val) => {
      this.countryList.forEach((item) => {
        item.countries.forEach((v) => {
          if (v.countryCode === val) {
            v['selected'] = true;
          }
        });

        item.disabled = item.countries.every((v) => v.disabled);
        item['selected'] = item['countries'].some((v) => v['selected']);
      });
    });
  }

  setList(v: any[]) {
    this.countryList = v;
    this.setChecked();
  }
}
