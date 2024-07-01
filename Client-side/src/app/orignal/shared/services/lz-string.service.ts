import { Injectable } from '@angular/core';
import * as JSLZString from 'lz-string';

@Injectable({
  providedIn: 'root',
})
export class LZStringService {
  compress(data: string) {
    return JSLZString.compressToUTF16(data);
  }
  decompress(data: string) {
    return JSLZString.decompressFromUTF16(data);
  }

  compressBase64(data: string) {
    return JSLZString.compressToBase64(data);
  }
  decompressBase64(data: string) {
    return JSLZString.decompressFromBase64(data);
  }
}
