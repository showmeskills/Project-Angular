import { Component, DestroyRef, Input, OnInit, WritableSignal, computed, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import moment from 'moment';
import { Subscription, interval } from 'rxjs';

interface RemainingTimer {
  day: TimeUnit;
  hour: TimeUnit;
  min: TimeUnit;
  sec: TimeUnit;
}

interface TimeUnit {
  time: number;
  unit: string;
}

@Component({
  selector: 'app-tournament-timer',
  templateUrl: './tournament-timer.component.html',
  styleUrls: ['./tournament-timer.component.scss'],
})
export class TournamentTimerComponent implements OnInit {
  constructor(private destroyRef: DestroyRef) {}

  defaultTimerValue = {
    day: {
      time: 0,
      unit: 'D',
    },
    hour: {
      time: 0,
      unit: 'H',
    },
    min: {
      time: 0,
      unit: 'M',
    },
    sec: {
      time: 0,
      unit: 'S',
    },
  };

  /** 计时器参数 */
  @Input() calcTimer: number = 0;
  _remainingTimer: WritableSignal<RemainingTimer | null> = signal(null);
  renderRemainingTimer = computed(() => this._remainingTimer());

  /** 默认状态 */
  renderLodingTimer = computed(() => this.defaultTimerValue);

  /** 计时器订阅 */
  timerSubscription!: Subscription;

  ngOnInit() {
    this.onStartTimer();
  }

  onStartTimer() {
    this.timerSubscription?.unsubscribe();
    let calcTimer = this.calcTimer;
    this.timerSubscription = interval(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (calcTimer === 0) {
          this.timerSubscription?.unsubscribe();
          this._remainingTimer.set(null);
          return;
        }
        calcTimer -= 1000;
        this._remainingTimer.set({
          day: {
            time: moment.duration(calcTimer).days(),
            unit: 'D',
          },
          hour: {
            time: moment.duration(calcTimer).hours(),
            unit: 'H',
          },
          min: {
            time: moment.duration(calcTimer).minutes(),
            unit: 'M',
          },
          sec: {
            time: moment.duration(calcTimer).seconds(),
            unit: 'S',
          },
        });
      });
  }
}
