import { Injectable } from '@angular/core';
import { timer } from 'rxjs';
import { EncryptService } from 'src/app/shared/service/encrypt.service';
import { environment } from 'src/environments/environment';
import { OrignalService } from '../../orignal.service';
import { LZStringService } from './lz-string.service';
@Injectable({
  providedIn: 'root',
})
export class WsService {
  constructor(
    private orignalService: OrignalService,
    private encryptService: EncryptService,
    private lZStringService: LZStringService
  ) {}

  private ws!: WebSocket;
  /** 是否销毁 */
  private isDestory: boolean = false;

  /**
   * 初始化原创游戏WebSocket
   *
   * @param url
   * @param encrypt 是否加密
   */
  init(url: string) {
    this.destory();
    this.isDestory = false;
    this.ws = new WebSocket(url);
    this.ws.onopen = () => {
      this.ws.send(
        this.encryptService.aesEncrypt(
          JSON.stringify({
            action: 'JoinRoom',
          })
        )
      );
    };

    this.ws.onclose = e => {
      if (this.isDestory) {
        console.log('WS已销毁');
        return;
      }
      console.log('WS断线了,3S后自动重连...', e.code, '-----', e.reason, '------', e.wasClean);
      timer(3 * 1000).subscribe(_ => this.init(url));
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };

    this.ws.onmessage = (event: any) => {
      const data = JSON.parse(this.encryptService.aesDecrypt(this.lZStringService.decompressBase64(event.data)));
      if (data) {
        console.log('-----------后端返回-----------');
        console.log(data);
        this.orignalService.crashMessage$.next(data);
      }
    };
  }

  /**
   * 发送消息
   *
   * @param data
   */
  async sendMessage(data: any) {
    if (data?.action != 'type') {
      console.log('-----------前端发送消息-----------');
      console.log(JSON.stringify(data));
    }
    if (data?.data) {
      data.data = this.encryptService.encrypt(JSON.stringify(data.data), environment.orignal.originalRsaPublicKey);
    }
    // await firstValueFrom( timer(100));
    const aesEncrypt = this.encryptService.aesEncrypt(JSON.stringify(data));
    this.ws?.send(aesEncrypt);
  }

  /**
   * 销毁WS
   */
  destory() {
    this.isDestory = true;
    if (this.ws) this.ws.onclose = null;
    if (this.ws?.readyState == WebSocket.OPEN) {
      this.ws.close();
    }
  }
}
