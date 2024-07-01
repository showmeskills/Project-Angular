import { Component, OnInit } from '@angular/core';
import { TopUpService } from '../top-up.service';
import { SafeHtml } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';

@Component({
  selector: 'app-vn-th-transfer',
  templateUrl: './vn-th-transfer.component.html',
  styleUrls: ['./vn-th-transfer.component.scss'],
})
export class VnThTransferComponent implements OnInit {
  constructor(private topUpService: TopUpService) {}

  @ViewChild('iframe') iframeElementRef!: ElementRef;
  Htmldata: SafeHtml = '';
  callbackSub!: Subscription; //订阅绑定HTML网银信息

  ngOnInit() {
    this.callbackSub = this.topUpService.vnThTransferOnlineCallBackData.subscribe(data => {
      if (data.actionType == 2) {
        //第三方泰越
        setTimeout(() => {
          const iframeElement = <HTMLIFrameElement>this.iframeElementRef.nativeElement;
          if (iframeElement.contentDocument) {
            iframeElement.contentDocument.write(data.html);
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.callbackSub?.unsubscribe();
  }
}
