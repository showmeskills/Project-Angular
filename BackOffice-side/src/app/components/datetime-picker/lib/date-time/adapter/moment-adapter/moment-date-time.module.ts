/**
 * moment-date-time.module
 */

import { NgModule } from '@angular/core';
import {
  MomentDateTimeAdapter,
  OWL_MOMENT_DATE_TIME_ADAPTER_OPTIONS,
} from 'src/app/components/datetime-picker/lib/date-time/adapter/moment-adapter/moment-date-time-adapter.class';
import { OWL_MOMENT_DATE_TIME_FORMATS } from 'src/app/components/datetime-picker/lib/date-time/adapter/moment-adapter/moment-date-time-format.class';
import {
  DateTimeAdapter,
  OWL_DATE_TIME_LOCALE,
} from 'src/app/components/datetime-picker/lib/date-time/adapter/date-time-adapter.class';
import { OWL_DATE_TIME_FORMATS } from 'src/app/components/datetime-picker/lib/date-time/adapter/date-time-format.class';
// import { DateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE_PROVIDER } from 'ng-pick-datetime';

@NgModule({
  providers: [
    {
      provide: DateTimeAdapter,
      useClass: MomentDateTimeAdapter,
      deps: [OWL_DATE_TIME_LOCALE, OWL_MOMENT_DATE_TIME_ADAPTER_OPTIONS],
    },
  ],
})
export class MomentDateTimeModule {}

@NgModule({
  imports: [MomentDateTimeModule],
  providers: [{ provide: OWL_DATE_TIME_FORMATS, useValue: OWL_MOMENT_DATE_TIME_FORMATS }],
})
export class OwlMomentDateTimeModule {}
