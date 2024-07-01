import { Component, Input, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { ReviewItem } from 'src/app/shared/interfaces/review';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { ImgViewerComponent } from 'src/app/shared/components/img-viewer/img-viewer.component';
import { NgIf } from '@angular/common';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';

@Component({
  selector: 'review-content-order',
  templateUrl: './review-content-order.component.html',
  styleUrls: ['./review-content-order.component.scss'],
  standalone: true,
  imports: [FormRowComponent, NgIf, ImgViewerComponent, CurrencyValuePipe, LangPipe],
})
export class ReviewContentOrderComponent implements OnInit {
  constructor(public appService: AppService) {}

  @Input() data: ReviewItem;

  ngOnInit(): void {}
}
