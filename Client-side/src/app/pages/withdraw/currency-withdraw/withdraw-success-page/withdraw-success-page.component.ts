import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-withdraw-success-page',
  templateUrl: './withdraw-success-page.component.html',
  styleUrls: ['./withdraw-success-page.component.scss'],
})
export class WithdrawSuccessPageComponent implements OnInit {
  constructor(private router: Router, private appService: AppService) {}
  @Input() submitData: any;
  ngOnInit() {
    // console.log(111111, this.submitData);
  }

  submit() {
    this.router.navigate([this.appService.languageCode, 'wallet']);
  }
}
