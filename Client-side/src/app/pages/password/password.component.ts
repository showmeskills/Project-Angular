import { PasswordService } from './password.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.scss'],
  host: { class: 'flex' },
})
export class PasswordComponent implements OnInit {
  constructor(private passwordService: PasswordService) {}

  // orderStepSubscription: Subscription;
  orderStep: number = 1;

  ngOnInit(): void {
    //订单当前状态
    this.passwordService.orderStepSubject.subscribe(step => {
      if (step != this.orderStep) {
        this.orderStep = step;
      }
    });
  }
  // ngOnDestroy(): void {
  //   this.orderStepSubscription?.unsubscribe();
  // }
  jumpToPage(x: number) {
    this.passwordService.orderStepSubject.next(x);
  }
}
