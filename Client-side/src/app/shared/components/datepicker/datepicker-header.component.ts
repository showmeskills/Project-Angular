import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatCalendar } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS, MatDateFormats } from '@angular/material/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'datepicker-header',
  templateUrl: './datepicker-header.component.html',
  styleUrls: ['./datepicker-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerHeaderComponent<D> implements OnInit, OnDestroy {
  private stateChangesSubscription!: Subscription;

  constructor(
    private matCalendar: MatCalendar<D>,
    private dateAdapter: DateAdapter<D>,
    private changeDetectorRef: ChangeDetectorRef,
    @Inject(MAT_DATE_FORMATS) private matDateFormats: MatDateFormats
  ) {}

  ngOnInit(): void {
    this.stateChangesSubscription = this.matCalendar.stateChanges.subscribe(() =>
      this.changeDetectorRef.markForCheck()
    );
  }

  ngOnDestroy() {
    this.stateChangesSubscription.unsubscribe();
  }

  get periodLabel() {
    return this.dateAdapter
      .format(this.matCalendar.activeDate, this.matDateFormats.display.monthYearLabel)
      .toLocaleUpperCase();
  }

  clicked(step: number, mode: 'month' | 'year') {
    this.matCalendar.activeDate =
      mode === 'month'
        ? this.dateAdapter.addCalendarMonths(this.matCalendar.activeDate, step)
        : this.dateAdapter.addCalendarYears(this.matCalendar.activeDate, step);
  }
}
