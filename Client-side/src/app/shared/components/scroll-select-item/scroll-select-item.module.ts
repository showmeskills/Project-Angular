import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { LifeObserveModule } from '../../directive/life-observe/life-observe.module';
import { ScrollSelectItemComponent } from './scroll-select-item.component';

@NgModule({
  declarations: [ScrollSelectItemComponent],
  imports: [CommonModule, FormsModule, MatTabsModule, LifeObserveModule],
  exports: [ScrollSelectItemComponent],
})
export class ScrollSelectItemModule {}
