import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterEvent, RouterOutlet } from '@angular/router';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { NgFor } from '@angular/common';
import { filter } from 'rxjs';
import { DestroyService } from 'src/app/shared/models/tools.model';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-messagestation-manage',
  templateUrl: './messagestation-manage.component.html',
  styleUrls: ['./messagestation-manage.component.scss'],
  standalone: true,
  imports: [NgFor, RouterOutlet, LangPipe],
  providers: [DestroyService],
})
export class MessagestationManageComponent implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private destroy$: DestroyService
  ) {
    router.events
      .pipe(
        takeUntil(destroy$),
        filter((e: any): e is RouterEvent => e instanceof RouterEvent)
      )
      .subscribe(() => {
        this.ngOnInit();
      });
  }

  activeTabIndex = 0;

  merchantList: any[] = [];

  tabs = [
    { name: '站内信记录', path: 'messagestation-log', lang: 'content.insite.rec' },
    { name: '站内信模板', path: 'messagestation-template', lang: 'content.insite.temp' },
  ];

  ngOnInit(): void {
    const { url } = this.router;
    this.activeTabIndex = this.tabs.findIndex((e) => url.includes(e.path));
  }

  onNav(i: number, path: string): void {
    this.activeTabIndex = i;

    const { queryParams } = this.route.snapshot;
    this.router.navigate(['/content/messagestation-manage/' + path], {
      queryParams,
    });
  }
}
