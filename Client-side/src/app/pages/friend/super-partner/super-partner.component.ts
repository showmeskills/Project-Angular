import { Component, OnInit } from '@angular/core';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { LayoutService } from 'src/app/shared/service/layout.service';
@UntilDestroy()
@Component({
  selector: 'app-super-partner',
  templateUrl: './super-partner.component.html',
  styleUrls: ['./super-partner.component.scss'],
})
export class SuperPartnerComponent implements OnInit {
  isH5!: boolean;
  constructor(private layout: LayoutService) {}

  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
  }
}
