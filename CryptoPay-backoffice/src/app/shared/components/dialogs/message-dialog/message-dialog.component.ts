import { Component, Inject, OnInit } from '@angular/core';
import { MatModalRef, MAT_MODAL_DATA } from 'src/app/shared/components/dialogs/modal';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-message-dialog',
  templateUrl: './message-dialog.component.html',
  styleUrls: ['./message-dialog.component.scss'],
  host: { class: 'flex' },
  standalone: true,
  imports: [NgIf],
})
export class MessageDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatModalRef<MessageDialogComponent>,
    @Inject(MAT_MODAL_DATA)
    public data: {
      hasSvg: boolean;
      svgName: string;
      hasTitle: boolean;
      title: string;
      content: string;
    }
  ) {}

  hasSvg!: boolean;
  ngOnInit() {
    this.hasSvg = this.data.hasSvg;
  }

  close(): void {
    this.dialogRef.close();
  }
}
