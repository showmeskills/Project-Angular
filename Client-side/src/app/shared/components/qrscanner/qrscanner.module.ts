import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { NgxScannerQrcodeModule } from 'ngx-scanner-qrcode';
import { PipesModule } from '../../pipes/pipes.module';
import { QrscannerComponent } from './qrscanner.component';

@NgModule({
  imports: [CommonModule, FormsModule, MatDialogModule, NgxScannerQrcodeModule, PipesModule],
  declarations: [QrscannerComponent],
})
export class QrScannererModule {}
