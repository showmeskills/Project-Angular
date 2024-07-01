/**
 * date-time-picker-intl.service
 */

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OwlDateTimeIntl {
  /**
   * Stream that emits whenever the labels here are changed. Use this to notify
   * components if the labels have changed after initialization.
   */
  readonly changes: Subject<void> = new Subject<void>();

  /** A label for the up second button (used by screen readers).  */
  upSecondLabel = 'Add a second';

  /** A label for the down second button (used by screen readers).  */
  downSecondLabel = 'Minus a second';

  /** A label for the up minute button (used by screen readers).  */
  upMinuteLabel = 'Add a minute';

  /** A label for the down minute button (used by screen readers).  */
  downMinuteLabel = 'Minus a minute';

  /** A label for the up hour button (used by screen readers).  */
  upHourLabel = 'Add a hour';

  /** A label for the down hour button (used by screen readers).  */
  downHourLabel = 'Minus a hour';

  /** A label for the previous month button (used by screen readers). */
  prevMonthLabel = '上一月';

  /** A label for the next month button (used by screen readers). */
  nextMonthLabel = '下一月';

  /** A label for the previous year button (used by screen readers). */
  prevYearLabel = '上一年';

  /** A label for the next year button (used by screen readers). */
  nextYearLabel = '下一年';

  /** A label for the previous multi-year button (used by screen readers). */
  prevMultiYearLabel = 'Previous 21 years';

  /** A label for the next multi-year button (used by screen readers). */
  nextMultiYearLabel = 'Next 21 years';

  /** A label for the 'switch to month view' button (used by screen readers). */
  switchToMonthViewLabel = 'Change to month view';

  /** A label for the 'switch to year view' button (used by screen readers). */
  switchToMultiYearViewLabel = 'Choose month and year';

  /** A label for the cancel button */
  cancelBtnLabel = '关闭';

  /** A label for the set button */
  setBtnLabel = '确认';

  /** A label for the range 'from' in picker info */
  rangeFromLabel = '从';

  /** A label for the range 'to' in picker info */
  rangeToLabel = '到';

  /** A label for the hour12 button (AM) */
  hour12AMLabel = 'AM';

  /** A label for the hour12 button (PM) */
  hour12PMLabel = 'PM';
}
