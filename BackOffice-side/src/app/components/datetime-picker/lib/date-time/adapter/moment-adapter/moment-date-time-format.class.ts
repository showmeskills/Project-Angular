/**
 * moment-date-time-format.class
 */
import { OwlDateTimeFormats } from 'src/app/components/datetime-picker/lib/date-time/adapter/date-time-format.class';

// import { OwlDateTimeFormats } from 'ng-pick-datetime';

export const OWL_MOMENT_DATE_TIME_FORMATS: {
  parseInput: string;
  dateA11yLabel: string;
  monthYearA11yLabel: string;
  datePickerInput: string;
  fullPickerInput: string;
  timePickerInput: string;
  monthYearLabel: string
} = {
  parseInput: 'l LT',
  fullPickerInput: 'l LT',
  datePickerInput: 'l',
  timePickerInput: 'LT',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY',
};
