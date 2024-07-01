import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ImageCropperModule } from 'ngx-image-cropper';
import { CustomizeFormModule } from 'src/app/shared/components/customize-form/customize-form.module';
import { ScrollbarModule } from 'src/app/shared/components/scrollbar/scrollbar.module';
import { SelectCurrencyModule } from 'src/app/shared/components/select-currency/select-currency.module';
import { LoadingModule } from 'src/app/shared/directive/loading/loading.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { SettingDialogComponent } from './setting-dialog/setting-dialog.component';
import { SettingsComponent } from './settings.component';
import { SettingsRoutes } from './settings.routing';

@NgModule({
  declarations: [SettingsComponent, SettingDialogComponent],
  imports: [
    CommonModule,
    SettingsRoutes,
    FormsModule,
    MatCheckboxModule,
    CustomizeFormModule,
    LoadingModule,
    PipesModule,
    ScrollbarModule,
    MatSlideToggleModule,
    SelectCurrencyModule,
    ImageCropperModule
  ],
})
export class SettingsModule {}
