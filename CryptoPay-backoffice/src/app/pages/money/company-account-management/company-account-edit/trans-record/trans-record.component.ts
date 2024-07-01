import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { AngularSvgIconModule } from 'angular-svg-icon';

@Component({
  selector: 'app-trans-record',
  templateUrl: './trans-record.component.html',
  styleUrls: ['./trans-record.component.scss'],
  standalone: true,
  imports: [AngularSvgIconModule, LabelComponent, LangPipe],
})
export class TransRecordComponent implements OnInit {
  public id = '';

  constructor(public modal: NgbActiveModal, private router: Router, private route: ActivatedRoute) {
    this.route.queryParams.subscribe((value: any) => (this.id = value.id));
  }

  data: any = {};

  ngOnInit(): void {
    this.onInit();
  }

  // modal 页面初始化
  onInit(): void {}

  // modal 页面关闭
  close() {
    this.modal.dismiss();
    // let navigationExtras: NavigationExtras={
    //   queryParams:{
    //     id:this.id,
    //     isOpenTransModule:'false'
    //   }
    // }
    // this.router.navigate([`/money/companyAccountManagement/companyAccountEdit/${this.id}`],navigationExtras)
  }
}
