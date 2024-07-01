import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-success-verification-page',
  templateUrl: './success-verification-page.component.html',
  styleUrls: ['./success-verification-page.component.scss'],
})
export class SuccessVerificationPageComponent implements OnInit {
  constructor() {}
  @Input() header: string = '';
  @Input() successText: string = '';
  ngOnInit() {}
}
