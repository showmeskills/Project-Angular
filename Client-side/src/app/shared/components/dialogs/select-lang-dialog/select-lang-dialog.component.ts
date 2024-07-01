import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { LangModel } from 'src/app/shared/interfaces/country.interface';
import { CountryUtilsService } from 'src/app/shared/service/country.service';

@UntilDestroy()
@Component({
  selector: 'app-select-lang-dialog',
  templateUrl: './select-lang-dialog.component.html',
  styleUrls: ['./select-lang-dialog.component.scss'],
})
export class SelectLangDialogComponent implements OnInit {
  countries!: LangModel[]; //lang全部信息

  constructor(
    private appService: AppService,
    private countryUtils: CountryUtilsService,
    public dialogRef: MatDialogRef<SelectLangDialogComponent>,
    public router: Router
  ) {
    //本地获取所有语系
    this.appService.languages$.pipe(untilDestroyed(this)).subscribe(x => (this.countries = x));
  }

  columnNumber: number = 4;
  colunmDatas: any = []; //排列好的地区数据

  ngOnInit() {
    this.getColumnData();
  }

  // 瀑布流数据处理
  getColumnData() {
    const column = new Array(this.columnNumber);
    for (let i = 0; i < this.columnNumber; i++) {
      column[i] = [];
    }
    let columnIndex = 0;
    for (const item of Object.values(this.countries)) {
      column[columnIndex].push(item);
      columnIndex += 1;
      if (columnIndex === column.length) {
        columnIndex = 0;
      }
    }
    this.colunmDatas = column;
  }

  /**
   * 国旗class
   *
   * @param key
   */
  className(key: any) {
    return this.countryUtils.getcountryClassName(key.code);
  }

  /**
   * 关闭弹窗
   */
  close(): void {
    this.dialogRef.close();
  }

  selectLang(selectedLang: LangModel) {
    const targetCode = selectedLang.code.toLowerCase();
    if (this.appService.languageCode === targetCode) return;
    this.appService.selectLangFun(targetCode);
    this.dialogRef.close();
  }
}
