import { Component, Input, OnInit } from '@angular/core';
import { ApprovalStatusService } from 'src/app/pages/proxy/approval/approval.service';
import { LabelApprovalState } from 'src/app/shared/interfaces/agent';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';

@Component({
  selector: 'approval-status',
  templateUrl: './approval-status.component.html',
  standalone: true,
  imports: [LabelComponent, LangPipe],
})
export class ApprovalStatusComponent implements OnInit {
  constructor(private approvalStatus: ApprovalStatusService, public lang: LangService) {}

  data: LabelApprovalState = {} as LabelApprovalState;

  private _status: string;
  @Input('status')
  get status() {
    return this._status || '';
  }

  set status(v: string) {
    this.approvalStatus.get(v).then((item) => {
      this.data = item;
    });
  }

  ngOnInit(): void {}
}
