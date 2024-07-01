import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import {
  NgxScannerQrcodeComponent,
  NgxScannerQrcodeService,
  ScannerQRCodeConfig,
  ScannerQRCodeResult,
  ScannerQRCodeSelectedFiles,
} from 'ngx-scanner-qrcode';
import { delay } from 'rxjs/operators';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-qrscanner',
  templateUrl: './qrscanner.component.html',
  styleUrls: ['./qrscanner.component.scss'],
  providers: [TranslatePipe],
})
export class QrscannerComponent implements AfterViewInit {
  constructor(private dialogRef: MatDialogRef<QrscannerComponent>, private qrcode: NgxScannerQrcodeService) {}
  @ViewChild('action') action!: NgxScannerQrcodeComponent;
  scannerConfig: ScannerQRCodeConfig = {
    vibrate: 200,
    isBeep: false,
    // deviceActive: 1,
    constraints: {
      // facingMode: 'environment',
      audio: false,
      video: {
        width: window.innerWidth,
      },
    },
  };

  ngAfterViewInit(): void {
    this.action.isReady.pipe(delay(200)).subscribe(() => {
      this.action.start();
    });
  }

  close(): void {
    this.action.stop();
    this.dialogRef.close();
  }

  onEvent(e: ScannerQRCodeResult[]): void {
    const result = e[0]?.value;
    if (result) {
      this.action.stop();
      this.dialogRef.close(result);
      return;
    }
  }

  onSelects(event: any): void {
    const files = event.target.files;
    this.qrcode.loadFilesToScan(files, this.scannerConfig).subscribe((res: ScannerQRCodeSelectedFiles[]) => {
      let result = '';
      if (res && res[0].data) {
        result = res[0]?.data[0]?.value;
      }
      event.target.value = '';
      this.action.stop();
      this.dialogRef.close(result);
      return;
    });
  }
}
