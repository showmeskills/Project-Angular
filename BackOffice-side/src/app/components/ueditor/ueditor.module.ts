import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { UEditorComponent } from 'src/app/components/ueditor/ueditor.component';
import { UEditorConfig } from 'src/app/components/ueditor/ueditor.config';
import { UploadDialogComponent } from 'src/app/components/ueditor/tools/upload-dialog/upload-dialog.component';
import { UploadModule } from 'src/app/shared/components/upload/upload.module';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { LangModule } from 'src/app/shared/components/lang/lang.module';
const defaultConfig = {
  js: [`./assets/ueditor/ueditor.config.js`, `./assets/ueditor/ueditor.all.min.js`],
  // 默认前端配置项
  options: {
    UEDITOR_HOME_URL: '/assets/ueditor/',
  },
};

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    UploadModule,
    AngularSvgIconModule.forRoot(),
    MatDialogModule,
    LangModule,
    UEditorComponent,
    UploadDialogComponent,
  ],
  exports: [UEditorComponent],
  providers: [{ provide: UEditorConfig, useValue: defaultConfig }],
})
export class UEditorModule {
  static forRoot(config: UEditorConfig): ModuleWithProviders<UEditorModule> {
    return {
      ngModule: UEditorModule,
      providers: [{ provide: UEditorConfig, useValue: config }],
    };
  }
}
