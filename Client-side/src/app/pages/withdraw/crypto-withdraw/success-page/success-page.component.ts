import { Component, Input, OnInit, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { ScrollbarComponent } from 'src/app/shared/components/scrollbar/scrollbar.component';
@Component({
  selector: 'app-success-page',
  templateUrl: './success-page.component.html',
  styleUrls: ['./success-page.component.scss'],
})
export class SuccessPageComponent implements OnInit {
  constructor(
    private router: Router,
    private appService: AppService,
    @Optional() private Scrollbars: ScrollbarComponent,
  ) {}
  @Input() submitData: any;

  /** 提法得虚预计提款 */
  @Input() coinAmount: number = 0;

  ngOnInit() {
    this.Scrollbars?.scrollToTop();
  }

  submit() {
    this.router.navigate([this.appService.languageCode, 'wallet']);
  }

  minus(a: number, b: number) {
    return Number(a).minus(Number(b));
  }
}
