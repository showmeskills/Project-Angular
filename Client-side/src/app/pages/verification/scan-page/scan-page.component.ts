import { Component, Input, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { GeneralService } from 'src/app/shared/service/general.service';

@Component({
  selector: 'app-scan-page',
  templateUrl: './scan-page.component.html',
  styleUrls: ['./scan-page.component.scss'],
})
export class ScanPageComponent implements OnInit {
  constructor(private generalService: GeneralService, public appService: AppService) {}

  @Input() googleValideCode: string = '';
  @Input() googleValidekey: string = '';

  get qrCode() {
    const code = this.googleValideCode.split('&chl=')[1];
    return decodeURIComponent(code);
  }

  ngOnInit() {}
}
