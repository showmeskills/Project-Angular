import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Subscription, timer } from 'rxjs';
import { CollectionEvent } from '../../interfaces/collection-event';
import { DataCollectionService } from '../../service/data-collection.service';

@UntilDestroy()
@Component({
  selector: 'app-data-collection-ui',
  templateUrl: './data-collection-ui.component.html',
  styleUrls: ['./data-collection-ui.component.scss'],
})
export class DataCollectionUiComponent implements OnInit {
  constructor(private dataCollectionService: DataCollectionService) {}

  pointInfos: Array<string> = [];
  sendInfos: Array<any> = [];
  publicInfos: Array<string> = [];
  /** 发送间隔 */
  time: number = 0;
  /** 累计发送数量 */
  count: number = 100;
  time2: number = 0;
  sendCount: number = 0;
  isShowDetail: boolean = false;
  successCount: number = 0;
  failCount: number = 0;
  pointCount: number = 0;
  tipsInfo: any[] = [];

  numTimer!: Subscription;

  ngOnInit() {
    this.init();
    this.dataCollectionService.publicInfoSubject.pipe(untilDestroyed(this)).subscribe(x => {
      if (x === 'INIT') {
        this.publicInfos = [];
        this.init();
        return;
      }
      this.publicInfos.push(x);
    });
    this.dataCollectionService.pointInfoSubject.pipe(untilDestroyed(this)).subscribe((x: CollectionEvent | null) => {
      if (x) {
        this.pointCount += 1;
        let pointInfo = `eventId:${x.eventId}\nactionTime:${x.actionTime}`;
        if (x.actionValue1 != null) {
          pointInfo += `\nactionValue1:${x.actionValue1}`;
        }
        if (x.actionValue2 != null) {
          pointInfo += `\nactionValue2:${x.actionValue2}`;
        }
        if (x.actionValue3 != null) {
          pointInfo += `\nactionValue3:${x.actionValue3}`;
        }
        if (x.actionValue4 != null) {
          pointInfo += `\nactionValue4:${x.actionValue4}`;
        }
        if (x.actionValue5 != null) {
          pointInfo += `\nactionValue5:${x.actionValue5}`;
        }
        if (x.actionValue6 != null) {
          pointInfo += `\nactionValue6:${x.actionValue6}`;
        }
        if (x.actionValue7 != null) {
          pointInfo += `\nactionValue7:${x.actionValue7}`;
        }
        if (x.actionValue8 != null) {
          pointInfo += `\nactionValue8:${x.actionValue8}`;
        }
        if (x.actionValue9 != null) {
          pointInfo += `\nactionValue8:${x.actionValue8}`;
        }
        if (x.actionValue10 != null) {
          pointInfo += `\nactionValue8:${x.actionValue8}`;
        }
        this.pointInfos.unshift(pointInfo);
        this.tipsInfo.unshift(pointInfo);
        if (this.tipsInfo.length > 3) {
          this.tipsInfo.splice(this.tipsInfo.length - 1, 1);
        }
        if (this.pointInfos.length > 50) {
          this.pointInfos.splice(this.pointInfos.length, 1);
        }
      }
    });
    this.dataCollectionService.sendInfoSubject.pipe(untilDestroyed(this)).subscribe(x => {
      if (x != null) {
        this.sendCount += 1;
        if (x) {
          this.successCount += 1;
        } else {
          this.failCount += 1;
        }
        this.sendInfos.push({ result: x, count: this.sendCount });
        if (this.sendInfos.length > 20) {
          this.sendInfos.splice(0, 1);
        }
      }
    });
  }

  /**
   * 初始化
   */
  private init() {
    this.time = this.dataCollectionService.time / 1000;
    this.time2 = this.time;
    this.numTimer?.unsubscribe();
    this.numTimer = timer(0, 1000)
      .pipe(untilDestroyed(this))
      .subscribe(_ => {
        this.time2 -= 1;
        if (this.time2 <= -1) {
          this.time2 = this.time;
        }
      });
  }

  toggle2(contentContainer: HTMLElement, btnExpanded: HTMLElement, height: number) {
    if (btnExpanded.classList.contains('expanded')) {
      btnExpanded.classList.remove('expanded');
      contentContainer.style.height = '0';
    } else {
      btnExpanded.classList.add('expanded');
      contentContainer.style.height = height + 'px';
    }
  }

  toggle(contentContainer: HTMLElement, btnExpanded: HTMLElement) {
    if (contentContainer.style.height === '') {
      contentContainer.style.height = contentContainer.scrollHeight + 'px';
    }
    if (btnExpanded.classList.contains('expanded')) {
      setTimeout(() => {
        btnExpanded.classList.remove('expanded');
        contentContainer.style.height = '0';
      });
    } else {
      btnExpanded.classList.add('expanded');
      contentContainer.style.height = contentContainer.scrollHeight + 'px';
    }
  }

  clear(event: Event) {
    event.stopPropagation();
    this.pointInfos = [];
  }

  removeTip(index: number) {
    this.tipsInfo.splice(index, 1);
  }
}
