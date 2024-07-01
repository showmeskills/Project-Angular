import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { AppService } from 'src/app/app.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';

@Component({
  selector: 'channel-sub-card',
  templateUrl: './channel-sub-card.component.html',
  styleUrls: ['./channel-sub-card.component.scss'],
  standalone: true,
  imports: [LangPipe],
})
export class ChannelSubCardComponent implements OnInit {
  constructor(private activatedRoute: ActivatedRoute, private appService: AppService) {
    const { id } = activatedRoute.snapshot.params;
    this.id = id;
  }

  id = '';
  isLoading = false;
  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页

  ngOnInit(): void {}

  loadData(): void {}

  // loading处理
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }
}
