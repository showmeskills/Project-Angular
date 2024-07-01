import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-digital-guide',
  templateUrl: './digital-guide.component.html',
  styleUrls: ['./digital-guide.component.scss'],
})
export class DigitalGuideComponent implements OnInit {
  constructor(private router: Router, private appService: AppService) {}
  @Output() doClose = new EventEmitter();

  ngOnInit() {}

  handleCloseGuide() {
    this.doClose.emit(false);
  }

  toExChange() {
    this.router.navigate([this.appService.languageCode, 'exChange', 'purchase']);
  }
}
