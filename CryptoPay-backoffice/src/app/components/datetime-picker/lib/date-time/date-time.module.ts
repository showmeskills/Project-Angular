/**
 * date-time.module
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import {
  OWL_DTPICKER_SCROLL_STRATEGY_PROVIDER,
  OwlDateTimeComponent,
} from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeContainerComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-container.component';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { OwlDateTimeIntl } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-intl.service';
import { OwlMonthViewComponent } from 'src/app/components/datetime-picker/lib/date-time/calendar-month-view.component';
import { OwlCalendarBodyComponent } from 'src/app/components/datetime-picker/lib/date-time/calendar-body.component';
import { OwlYearViewComponent } from 'src/app/components/datetime-picker/lib/date-time/calendar-year-view.component';
import { OwlMultiYearViewComponent } from 'src/app/components/datetime-picker/lib/date-time/calendar-multi-year-view.component';
import { OwlMultiMonthViewComponent } from 'src/app/components/datetime-picker/lib/date-time/calendar-multi-month-view.component';
import { OwlTimerBoxComponent } from 'src/app/components/datetime-picker/lib/date-time/timer-box.component';
import { OwlTimerComponent } from 'src/app/components/datetime-picker/lib/date-time/timer.component';
import { NumberFixedLenPipe } from 'src/app/components/datetime-picker/lib/date-time/numberedFixLen.pipe';
import { OwlCalendarComponent } from 'src/app/components/datetime-picker/lib/date-time/calendar.component';
import { OwlDateTimeInlineComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-inline.component';
import { OwlDialogModule } from 'src/app/components/datetime-picker/lib/dialog/dialog.module';
import { OwlTimerPickerComponent } from 'src/app/components/datetime-picker/lib/date-time/timer-picker.component';
import { LangModule } from 'src/app/shared/components/lang/lang.module';
@NgModule({
  imports: [
    CommonModule,
    OverlayModule,
    OwlDialogModule,
    A11yModule,
    LangModule,
    OwlDateTimeTriggerDirective,
    OwlDateTimeInputDirective,
    OwlDateTimeComponent,
    OwlDateTimeContainerComponent,
    OwlMultiYearViewComponent,
    OwlMultiMonthViewComponent,
    OwlYearViewComponent,
    OwlMonthViewComponent,
    OwlTimerPickerComponent,
    OwlTimerComponent,
    OwlTimerBoxComponent,
    OwlCalendarComponent,
    OwlCalendarBodyComponent,
    NumberFixedLenPipe,
    OwlDateTimeInlineComponent,
  ],
  exports: [
    OwlCalendarComponent,
    OwlTimerComponent,
    OwlDateTimeTriggerDirective,
    OwlDateTimeInputDirective,
    OwlTimerPickerComponent,
    OwlDateTimeComponent,
    OwlDateTimeInlineComponent,
    OwlMultiYearViewComponent,
    OwlMultiMonthViewComponent,
    OwlYearViewComponent,
    OwlMonthViewComponent,
    NumberFixedLenPipe,
  ],
  providers: [OwlDateTimeIntl, OWL_DTPICKER_SCROLL_STRATEGY_PROVIDER],
})
export class OwlDateTimeModule {}
