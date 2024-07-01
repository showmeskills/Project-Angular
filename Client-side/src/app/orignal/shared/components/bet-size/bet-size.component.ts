import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { PokerInfor } from 'src/app/orignal/shared/interfaces/hilo-info.interface';
import { BetService } from '../../services/bet.service';
@UntilDestroy()
@Component({
  selector: 'app-bet-size',
  templateUrl: './bet-size.component.html',
  styleUrls: ['./bet-size.component.scss'],
})
export class BetSizeComponent implements OnInit {
  /** 购买大小 */
  @Output() buyChange = new EventEmitter();

  /** 能否买大小操作 */
  @Input() canBuy?: boolean = false;
  constructor(private betService: BetService) {}

  card!: PokerInfor | null;
  ngOnInit() {
    this.betService.hiloCardData$.pipe(untilDestroyed(this)).subscribe((x: PokerInfor | null) => {
      this.card = x;
    });
  }

  handleBuy(type: string) {
    this.buyChange.emit(type);
  }
}
