import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-success-verification',
  templateUrl: './success-verification.component.html',
  styleUrls: ['./success-verification.component.scss'],
})
export class SuccessVerificationComponent implements OnInit {
  constructor() {}

  @Input() header: string = '';
  @Input() successText: string = '';
  ngOnInit() {}
}
