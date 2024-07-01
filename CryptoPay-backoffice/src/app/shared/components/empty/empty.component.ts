import { Component, Input, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { DestroyService } from 'src/app/shared/models/tools.model';
import { takeUntil } from 'rxjs/operators';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { NgIf } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';

@Component({
  selector: 'empty',
  templateUrl: './empty.component.html',
  styleUrls: ['./empty.component.scss'],
  host: {
    class: 'container-empty',
    '[hidden]': 'show !== undefined ? !show : isLoading',
  },
  providers: [DestroyService],
  standalone: true,
  imports: [AngularSvgIconModule, NgIf, LangPipe],
})
export class EmptyComponent implements OnInit {
  constructor(public appService: AppService, private destroyed$: DestroyService) {}

  ngOnInit(): void {
    this.appService.loading$.pipe(takeUntil(this.destroyed$)).subscribe((loading) => {
      this.isLoading = loading;
    });
  }

  isLoading = false;

  @Input() icon = './assets/images/svg/icon-empty.svg';
  @Input() text?: string = undefined;
  @Input() show?: boolean = undefined;
}
