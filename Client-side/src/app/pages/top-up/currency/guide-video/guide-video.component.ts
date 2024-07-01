import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LocaleService } from 'src/app/shared/service/locale.service';

@Component({
  selector: 'app-guide-video',
  templateUrl: './guide-video.component.html',
  styleUrls: ['./guide-video.component.scss'],
})
export class GuideVideoComponent implements OnInit {
  videoLink!: string;

  constructor(
    public dialogRef: MatDialogRef<GuideVideoComponent>,
    public localeService: LocaleService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {
    if (this.data) {
      this.videoLink = this.data;
    }
  }

  close() {
    this.dialogRef.close();
  }
}
