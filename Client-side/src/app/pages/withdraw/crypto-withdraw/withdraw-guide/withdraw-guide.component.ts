import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-withdraw-guide',
  templateUrl: './withdraw-guide.component.html',
  styleUrls: ['./withdraw-guide.component.scss'],
})
export class WithdrawGuideComponent implements OnInit {
  constructor(private appService: AppService) {}
  @Output() doClose = new EventEmitter();
  @Input() orderSuccess?: boolean = false;
  @Input() transferType?: string = 'crypto'; // 'currency':法币、'crypto': 虚拟、'other':其它
  stepNum: number = 1; //当前步骤进度
  ngOnInit() {}

  handleCloseGuide() {
    this.doClose.emit(false);
  }

  getLink(page?: string): string {
    return `/${this.appService.languageCode}/withdrawal/` + page;
  }
}
