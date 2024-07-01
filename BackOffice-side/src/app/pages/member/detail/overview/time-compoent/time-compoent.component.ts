import { Component, OnInit, Input } from '@angular/core';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';

@Component({
  selector: 'time-compoent',
  templateUrl: './time-compoent.component.html',
  styleUrls: ['./time-compoent.component.scss'],
  standalone: true,
  imports: [
    FormRowComponent,
    FormsModule,
    NgIf,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    LangPipe,
  ],
})
export class TimeCompoentComponent implements OnInit {
  @Input() timeMode;
  constructor() {}
  min: any = new Date();
  ngOnInit(): void {}
}
