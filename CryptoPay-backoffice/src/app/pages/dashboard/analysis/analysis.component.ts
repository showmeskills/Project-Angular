import { Component, OnDestroy, OnInit } from '@angular/core';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { AppService } from 'src/app/app.service';
import { LangService } from 'src/app/shared/components/lang/lang.service';

@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.scss'],
  standalone: true,
})
export class AnalysisComponent implements OnInit, OnDestroy {
  constructor(private subHeader: SubHeaderService, public appService: AppService, public langService: LangService) {}

  ngOnDestroy(): void {}

  ngOnInit(): void {}
}
