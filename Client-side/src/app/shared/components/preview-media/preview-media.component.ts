import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-preview-media',
  templateUrl: './preview-media.component.html',
  styleUrls: ['./preview-media.component.scss'],
})
export class PreviewMediaComponent implements OnInit {
  url!: string;
  type!: string;

  constructor(
    private dialogRef: MatDialogRef<PreviewMediaComponent>,
    @Inject(MAT_DIALOG_DATA) private data: { url: string }
  ) {}

  ngOnInit() {
    const suffix = this.data.url.split('/').slice(-1).join('').split('.').slice(-1).join('');
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(suffix)) {
      this.type = 'image';
    } else if (['mp4', 'mov'].includes(suffix)) {
      this.type = 'video';
    }
    this.url = this.data.url;
  }

  close() {
    this.dialogRef.close();
  }
}
