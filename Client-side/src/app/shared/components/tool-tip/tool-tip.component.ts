import { ConnectedPosition } from '@angular/cdk/overlay';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { intersectionObserverConfig } from '../../directive/intersection-observer/intersection-observer.directive';
import { GeneralService } from '../../service/general.service';
import { LocaleService } from '../../service/locale.service';

@Component({
  selector: 'app-tool-tip',
  templateUrl: './tool-tip.component.html',
  styleUrls: ['./tool-tip.component.scss'],
})
export class ToolTipComponent implements OnInit {
  constructor(private generalService: GeneralService, private localeService: LocaleService) {}

  positionsMap: { up: ConnectedPosition; down: ConnectedPosition; left: ConnectedPosition; right: ConnectedPosition } =
    {
      up: {
        originX: 'center',
        originY: 'top',
        overlayX: 'center',
        overlayY: 'bottom',
        panelClass: 'tooltip-overlay-up',
      },
      down: {
        originX: 'center',
        originY: 'bottom',
        overlayX: 'center',
        overlayY: 'top',
        panelClass: 'tooltip-overlay-down',
      },
      left: {
        originX: 'start',
        originY: 'center',
        overlayX: 'end',
        overlayY: 'center',
        panelClass: 'tooltip-overlay-left',
      },
      right: {
        originX: 'end',
        originY: 'center',
        overlayX: 'start',
        overlayY: 'center',
        panelClass: 'tooltip-overlay-right',
      },
    };

  tooltipStatus: boolean = false;
  showPop$: Subject<boolean> = new Subject();
  copySuccess: string = this.localeService.getValue('copy_succe');
  tooltipClass!: boolean;

  @Input() state?: boolean;
  @Input() copyMode: 'icon' | 'custom' | null = null;
  @Input() copyContent?: string;
  @Input() copyIcon?: string = 'icon-copy';
  @Input() overlayMaxWidth?: string;
  @Input() direction: ('up' | 'down' | 'left' | 'right')[] = ['up', 'down', 'left', 'right'];
  @Input() intersectionObserver: boolean = true;
  @Input() tooltipsConfig!: intersectionObserverConfig;
  @Input() arrow: boolean = true;
  @Input() light?: boolean;

  @Output() afterCopy: EventEmitter<any> = new EventEmitter();

  get positions() {
    return this.direction.map(v => this.positionsMap[v]);
  }

  ngOnInit() {}

  showPop(skipRepeat: boolean = true) {
    if (skipRepeat && this.tooltipStatus) return;
    this.closePop();
    this.showPop$.next(true);
    this.tooltipStatus = true;
  }

  copy() {
    if (!this.copyContent) return;
    if (this.generalService.copyText(this.copyContent)) {
      this.afterCopy.emit();
      this.showPop();
      this.closePop(1000);
    }
  }

  closePop(time: number = 0) {
    if (time > 0) {
      timer(time)
        .pipe(takeUntil(this.showPop$))
        .subscribe(_ => {
          this.tooltipStatus = false;
        });
    } else {
      this.tooltipStatus = false;
    }
  }

  onIntersectFullChange(event: any) {
    this.tooltipClass = event[0].isIntersecting;
  }
}
