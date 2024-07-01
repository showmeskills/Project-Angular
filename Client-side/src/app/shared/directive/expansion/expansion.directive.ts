import {
  Directive,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  ViewContainerRef,
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';

@Directive({
  selector: '[appExpansion]',
})
export class ExpansionDirective implements OnChanges, OnDestroy {
  constructor(private vcr: ViewContainerRef) {}

  @Input() content!: HTMLElement;
  @Input() defaultExpanded: boolean = true;
  @Input() clickTrigger: Observable<boolean> | null = null;

  @Output() expandChange: EventEmitter<boolean> = new EventEmitter();

  clickSubscription?: Subscription;

  ngOnChanges() {
    if (this.clickTrigger) {
      this.clickSubscription?.unsubscribe();
      this.clickSubscription = this.clickTrigger.subscribe(v => {
        this.onClick(v);
      });
    } else {
      this.clickSubscription?.unsubscribe();
    }
  }

  ngOnDestroy() {
    this.clickSubscription?.unsubscribe();
  }

  @HostListener('click') onClick(stat: boolean | null = null) {
    const btnExpanded: HTMLElement = this.vcr.element.nativeElement;
    if (this.content.style.height === '') {
      this.content.style.height = this.content.scrollHeight + 'px';
    }
    const height = this.content.offsetHeight;
    if (height === 0 || (stat !== null && stat)) {
      if (this.defaultExpanded) {
        btnExpanded.classList.remove('closed');
      } else {
        btnExpanded.classList.add('expanded');
      }
      this.expandChange.emit(true);
      this.content.style.height = this.content.scrollHeight + 'px';
    } else {
      if (this.defaultExpanded) {
        btnExpanded.classList.add('closed');
      } else {
        btnExpanded.classList.remove('expanded');
      }
      this.expandChange.emit(false);
      this.content.style.height = '0';
    }
    const endListener = () => {
      if (this.content.offsetHeight > 0) {
        if (this.defaultExpanded) this.content.style.height = '';
        this.content.removeEventListener('transitionend', endListener);
      }
    };
    this.content.addEventListener('transitionend', endListener);
  }
}
