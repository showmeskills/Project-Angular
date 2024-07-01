import { Component, OnInit } from '@angular/core';
import { DestroyService } from 'src/app/shared/models/tools.model';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { takeUntil } from 'rxjs';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-vip-management',
  templateUrl: './vip.component.html',
  providers: [DestroyService],
  standalone: true,
  imports: [RouterOutlet],
})
export class VipComponent implements OnInit {
  constructor(
    private subHeader: SubHeaderService,
    private destroy$: DestroyService,
    private router: Router
  ) {}

  ngOnInit() {
    this.subHeader.merchantId$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.router.navigate([`/vip/vip-management/${this.subHeader.isFiveMerchant ? 'model-C' : 'model-A'}`]);
    });
  }
}
