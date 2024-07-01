import { Component, OnInit } from '@angular/core';
import { GeneralService } from 'src/app/shared/service/general.service';

@Component({
  selector: 'app-user-activities',
  templateUrl: './user-activities.component.html',
  styleUrls: ['./user-activities.component.scss'],
  host: { class: 'container' },
})
export class UserActivitiesComponent implements OnInit {
  constructor(private generalService: GeneralService) {}

  selectRangeValue: string = '7days';
  selectRange: number[] = [];
  ranges: any[] = [
    { name: '7天', value: '7days' },
    { name: '30天', value: '30days' },
    { name: '12个月', value: 12 },
  ];

  ngOnInit() {
    this.select(this.selectRangeValue);
  }

  select(v: string) {
    this.selectRangeValue = v;
    this.selectRange = this.generalService.getStartEndDateArray(v, 'M');

    //TODO: 发出请求
  }
}
