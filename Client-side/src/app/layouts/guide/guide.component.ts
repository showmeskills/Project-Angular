import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-guide',
  templateUrl: './guide.component.html',
  styleUrls: ['./guide.component.scss'],
})
export class GuideComponent implements OnInit {
  constructor(private dialogRef: MatDialogRef<GuideComponent>) {}

  step: number = 1;

  ngOnInit() {}

  close() {
    this.dialogRef.close();
  }

  nextStep() {
    if (this.step === 4) {
      this.close();
    } else {
      this.step += 1;
    }
  }
}
