import { Component, Input, OnChanges, SimpleChanges, TemplateRef, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BonusInfo } from 'src/app/shared/interfaces/bonus.interface';
import { CommonRealTimeData } from 'src/app/shared/interfaces/gameorder.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';

@Component({
  selector: 'app-races-table-template',
  templateUrl: './races-table-template.component.html',
  styleUrls: ['./races-table-template.component.scss'],
})
export class RacesTableTemplateComponent implements OnChanges {
  constructor(private layout: LayoutService) {}

  isH5 = toSignal(this.layout.isH5$);

  /** 表头 */
  @Input() tableHeader: string[] = [];
  _tableHeader = signal(this.tableHeader);
  renderTableHeader = computed(() => this._tableHeader());

  /** 表格数据 */
  @Input() tableData: CommonRealTimeData[] | BonusInfo[] = [];
  _tabaleData = signal(this.tableData);
  renderTableData = computed(() => {
    if (this._tabaleData()?.length) return this._tabaleData();
    return null;
  });

  /** loading 状态 */
  @Input() loading: boolean = false;
  _loading = signal(this.loading);
  renderLoading = computed(() => this._loading());

  /** skeleton 长度 */
  @Input() skeletonLength: number[] = new Array(11).fill(0);
  _skeletonLength = signal(this.skeletonLength);
  renderSkeletonLength = computed(() => this._skeletonLength());

  /** 对齐 columns */
  @Input() columns: number = 5;
  _columns = signal(this.columns);
  renderColumns = computed(() => this._columns());

  /** 默认 空数据高度 */
  @Input() emptyHeight: number = 572;
  _emptyHeight = signal(this.emptyHeight);
  renderEmptyHeight = computed(() => this._emptyHeight());

  /** 自定义表头 */
  @Input() customizedHeader?: TemplateRef<HTMLElement>;

  /** 自定义模版 */
  @Input()
  customizedData?: TemplateRef<HTMLElement>;

  ngOnChanges(changes: SimpleChanges) {
    this._tableHeader.update(() => changes?.tableHeader?.currentValue);
    this._loading.update(() => changes?.loading?.currentValue);
    this._skeletonLength.update(() => changes?.skeletonLength?.currentValue);
    this._columns.update(() => changes?.columns?.currentValue);
    this._tabaleData.update(() => this.tableData);
    this._emptyHeight.update(() => this.emptyHeight);
  }
}
