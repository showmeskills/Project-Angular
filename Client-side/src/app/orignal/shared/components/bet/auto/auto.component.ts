import { Component, ElementRef, Inject, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CacheService } from '../../../services/cache.service';
@Component({
  selector: 'orignal-auto',
  templateUrl: './auto.component.html',
  styleUrls: ['./auto.component.scss'],
})
export class AutoComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<AutoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private el: ElementRef,
    private cacheService: CacheService
  ) {}

  ngOnInit() {}

  /**
   * 关闭弹窗
   */
  close() {
    this.dialogRef.close();
  }
  changeBetNowTip(event: MatCheckboxChange) {
    this.cacheService.autoTipsShow = !event.checked;
  }
}
