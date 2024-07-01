import { Component, OnInit, Optional } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { AngularSvgIconModule } from 'angular-svg-icon';

@Component({
  templateUrl: './relative-select.component.html',
  styleUrls: ['./relative-select.component.scss'],
  standalone: true,
  imports: [AngularSvgIconModule, MatExpansionModule, NgFor, NgIf, FormsModule, TimeFormatPipe],
})
export class AnnouncementRelativeSelectComponent implements OnInit {
  constructor(
    @Optional() public modal: MatModalRef<AnnouncementRelativeSelectComponent>,
    private appService: AppService
  ) {}

  list: any[] = [];
  data: any[] = [];
  currentDataList: any[] = [];
  select: any[] = [];
  limit = 5;
  currentCategory: any = {};

  /** lifeCycle */
  ngOnInit(): void {}

  /** methods */
  onConfirm(): void {
    this.modal.close(this.select);
  }

  onItem(item: any, event?: MouseEvent): void {
    event?.stopPropagation();

    this.currentCategory = item;

    const sel = this.data ? this.data.filter((e) => e.categoryId === item.categoryId) : [];
    this.currentDataList = sel.map((e) => ({
      ...e,
      checked: this.select.some((j) => j.id === e.id),
    }));
  }

  onCheckbox(sub: any): void {
    if (sub.checked) {
      if (this.select.length + 1 > this.limit) {
        setTimeout(() => (sub.checked = false));
        return this.appService.showToastSubject.next({
          msg: '最多只能选择5个',
        });
      }

      this.select.push(sub);
    } else {
      this.select = this.select.filter((e) => e.id !== sub.id);
    }
  }
}
