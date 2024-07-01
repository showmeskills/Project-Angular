import { Location } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FriendService } from './../../friend.service';
@Component({
  selector: 'app-friend-header',
  templateUrl: './friend-header.component.html',
  styleUrls: ['./friend-header.component.scss'],
})
export class FriendHeaderComponent implements OnInit {
  @Input() headerTitle!: string;

  @Input() bgColor!: boolean;

  @Input() goRouter!: boolean;
  @Output() otherRouter = new EventEmitter();
  constructor(private location: Location, private friendService: FriendService) {}

  ngOnInit(): void {}
  goBack(): void {
    if (this.goRouter) {
      this.location.back();
    } else {
      this.otherRouter.emit();
    }
    this.friendService.isShowNav$.next(true);
  }
}
