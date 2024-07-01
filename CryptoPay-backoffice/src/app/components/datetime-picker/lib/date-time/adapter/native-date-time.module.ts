/**
 * native-date-time.module
 */

import { NgModule } from '@angular/core';
import { PlatformModule } from '@angular/cdk/platform';
import { DateTimeAdapter } from 'src/app/components/datetime-picker/lib/date-time/adapter/date-time-adapter.class';
import { NativeDateTimeAdapter } from 'src/app/components/datetime-picker/lib/date-time/adapter/native-date-time-adapter.class';
import { OWL_DATE_TIME_FORMATS } from 'src/app/components/datetime-picker/lib/date-time/adapter/date-time-format.class';
import { OWL_NATIVE_DATE_TIME_FORMATS } from 'src/app/components/datetime-picker/lib/date-time/adapter/native-date-time-format.class';

@NgModule({
  imports: [PlatformModule],
  providers: [{ provide: DateTimeAdapter, useClass: NativeDateTimeAdapter }],
})
export class NativeDateTimeModule {}

@NgModule({
  imports: [NativeDateTimeModule],
  providers: [{ provide: OWL_DATE_TIME_FORMATS, useValue: OWL_NATIVE_DATE_TIME_FORMATS }],
})
export class OwlNativeDateTimeModule {}
