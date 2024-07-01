import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EmptyModule } from 'src/app/shared/components/empty/empty.module';
import { LoadingModule } from 'src/app/shared/directive/loading/loading.module';
import { PipesModule } from '../../../../shared/pipes/pipes.module';
import { ScrollbarModule } from './../../../../shared/components/scrollbar/scrollbar.module';
import { SelectNetworkDialogComponent } from './select-network-dialog.component';

@NgModule({
  imports: [CommonModule, LoadingModule, PipesModule, EmptyModule, ScrollbarModule],
  declarations: [SelectNetworkDialogComponent],
  exports: [SelectNetworkDialogComponent],
})
export class SelectNetworkDialogComponentModule {}
