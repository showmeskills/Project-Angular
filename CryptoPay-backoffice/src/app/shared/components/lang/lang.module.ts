import { ModuleWithProviders, NgModule } from '@angular/core';
import { LangPipe, PreLangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurLangService, LangPrefix } from 'src/app/shared/components/lang/lang.service';

@NgModule({
  imports: [LangPipe, PreLangPipe],
  exports: [LangPipe, PreLangPipe],
  providers: [CurLangService],
})
export class LangModule {
  static forRoot(prefix: string): ModuleWithProviders<LangModule> {
    return {
      ngModule: LangModule,
      providers: [{ provide: LangPrefix, useValue: prefix }],
    };
  }
}
