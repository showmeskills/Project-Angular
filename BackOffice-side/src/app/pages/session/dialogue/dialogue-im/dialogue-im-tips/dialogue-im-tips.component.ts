import { Component, inject, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { SvgIconComponent, SvgIconRegistryService } from 'angular-svg-icon';
// eslint-disable-next-line @typescript-eslint/no-var-requires

@Component({
  selector: 'im-tips',
  standalone: true,
  imports: [CommonModule, LangPipe, SvgIconComponent],
  templateUrl: './dialogue-im-tips.component.html',
  styleUrls: ['./dialogue-im-tips.component.scss'],
})
export class DialogueImTipsComponent implements OnDestroy {
  private svgReg = inject(SvgIconRegistryService);

  @Input() type = 'primary';
  @Input() set icon(fileName: string) {
    this.iconName = fileName;
    this.svgRegister();
  }

  iconName = 'msg';

  constructor() {
    this.svgRegister();
  }

  svgRegister() {
    this.svgUnregister();
    this.svgReg.loadSvg(`assets/images/svg/im/${this.iconName}.svg`, this.iconName)?.subscribe();
  }

  svgUnregister() {
    this.svgReg.unloadSvg(`assets/images/svg/im/${this.iconName}.svg`);
  }

  ngOnDestroy(): void {
    this.svgUnregister();
  }
}
