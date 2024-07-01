import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TableHader } from 'src/app/shared/interfaces/affiliate.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { FriendService } from '../../friend.service';

@UntilDestroy()
@Component({
  selector: 'app-table-component',
  templateUrl: './table-component.component.html',
  styleUrls: ['./table-component.component.scss'],
})
export class TableComponentComponent implements OnInit {
  constructor(private layout: LayoutService, private friendService: FriendService) {}

  isH5!: boolean;

  /**@tableTmp 表格模版 */
  @Input() tableHeader!: TableHader[];

  /**@tableTmp 表格模版 */
  @Input() tableBodyTmp!: TemplateRef<any>;

  /**@h5Data  模版*/
  @Input() h5DataTemp!: TemplateRef<any>;

  /**@data 数据长度 */
  @Input() dataLen: number = 0;

  /**@loading 加载状态 */
  @Input() loading: boolean = false;

  /**@onLoadData 数据加载函数 */
  @Output() onLoadData: EventEmitter<any> = new EventEmitter();

  /**@page 页码*/
  @Input() page: number = 1;

  /**@pageSize 页码尺寸 */
  @Input() pageSize: number = 10;

  /**@total 总页数 */
  @Input() total: number = 0;

  /**@isShowInfo 文案提示 */
  @Input() isShowInfo: boolean = true;

  /**@infoTips  到处数据提示 */
  @Input() infoTips!: string;

  /**@isMinHeight 是否需要minHeight */
  @Input() isMinHeight: boolean = true;

  /**@isExportBtn 是否要导出按钮 */
  @Input() isExportBtn: boolean = true;

  /**@tableClassName */
  @Input() tableClassName!: string;
  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(v => (this.isH5 = v));
  }

  /**@nextData 下一页数据*/
  nextData() {
    const paginator = {
      page: this.page,
      pageSize: this.pageSize,
      total: this.total,
    };
    this.onLoadData.emit(paginator);
  }

  //导出历史查询窗口
  openToExport(): void {
    this.friendService.commingSoon();
    // this.dialog.open(HistoryPopupComponent, {
    //   panelClass: 'custom-dialog-container',
    // })
  }
}
