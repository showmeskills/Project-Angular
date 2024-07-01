import { OnInit, OnChanges, Directive, Input, Renderer2, ElementRef, SimpleChanges } from '@angular/core';

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

@Directive({
  selector: '[appLoading]',
  standalone: true,
})
export class LoadingDirective implements OnInit, OnChanges {
  @Input() appLoading: null | number | string | boolean = false;
  @Input() loadingBgColor?: string = 'transparent';
  @Input() loadingSpinnerHasShadow?: boolean = false;

  uid?: string;

  constructor(
    private targetEl: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    const position = getComputedStyle(this.targetEl.nativeElement).getPropertyValue('position');
    if (position === 'static') this.targetEl.nativeElement.style.position = 'relative';

    this.uid = 'loading-container-' + uuidv4();

    const loadingContainer = this.renderer.createElement('div');
    this.renderer.addClass(loadingContainer, 'app-local-loading');
    this.renderer.addClass(loadingContainer, this.uid);
    this.renderer.setStyle(loadingContainer, 'display', this.appLoading ? 'flex' : 'none');
    this.renderer.setStyle(loadingContainer, 'background-color', this.loadingBgColor);

    const spinnerContainer = this.renderer.createElement('div');
    this.renderer.addClass(spinnerContainer, 'app-local-loading-spinner');
    const spinnerInnerDiv = this.renderer.createElement('div');
    const spinnerInnerDot1 = this.renderer.createElement('i');
    const spinnerInnerDot2 = this.renderer.createElement('i');
    const spinnerInnerDot3 = this.renderer.createElement('i');
    this.renderer.addClass(spinnerInnerDiv, 'animation-icon-loading-dot');
    this.renderer.appendChild(spinnerContainer, spinnerInnerDiv);
    this.renderer.appendChild(spinnerInnerDiv, spinnerInnerDot1);
    this.renderer.appendChild(spinnerInnerDiv, spinnerInnerDot2);
    this.renderer.appendChild(spinnerInnerDiv, spinnerInnerDot3);
    this.renderer.appendChild(loadingContainer, spinnerContainer);
    this.renderer.appendChild(this.targetEl.nativeElement, loadingContainer);
  }

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['appLoading']) {
      const container = this.targetEl.nativeElement;
      const div = container.querySelector('.' + this.uid);
      if (div) {
        this.renderer.setStyle(div, 'display', this.appLoading ? 'flex' : 'none');
      }
    }
  }
}
