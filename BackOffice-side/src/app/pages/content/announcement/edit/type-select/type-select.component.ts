import { Component, Input } from '@angular/core';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';

@Component({
  templateUrl: './type-select.component.html',
  styleUrls: ['./type-select.component.scss'],
  standalone: true,
  imports: [AngularSvgIconModule, MatExpansionModule, NgFor, FormsModule, NgIf, EmptyComponent, LangPipe],
})
export class AnnouncementTypeSelectComponent {
  @Input() list: any[] = [];
  @Input() select!: string;

  constructor(public modal: MatModalRef<AnnouncementTypeSelectComponent>) {}

  onConfirm(): void {
    this.modal.close(this.select);
  }
}
