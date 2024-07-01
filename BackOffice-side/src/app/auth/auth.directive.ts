import { Directive, Input, OnInit, ViewContainerRef } from '@angular/core';
import { AuthService } from './auth.service';

@Directive({
  selector: '[permission]',
})
export class AuthDirective implements OnInit {
  @Input() permission!: string | Array<string>;

  constructor(
    private authService: AuthService,
    private viewContainer: ViewContainerRef
  ) {}

  ngOnInit(): void {
    // if (Array.isArray(this.permission)) {
    //   // console.log(this.permission);
    //   let result = false;
    //   this.permission.forEach(x => {
    //     // console.log(x);
    //     if (this.authService.checkPermission(x)) {
    //       result = true;
    //
    //       return;
    //     }
    //   });
    //   if (result === false) {
    //     this.viewContainer.element.nativeElement.remove();
    //   }
    // } else {
    //   if (this.authService.checkPermission(this.permission)) {
    //   } else {
    //     // 如果是admin就可以编辑，其他read only
    //     const obj = this.viewContainer.element.nativeElement;
    //     if (obj instanceof HTMLInputElement && (obj.type == 'text') || obj.type == "radio" || obj.type == "checkbox") {
    //       this.viewContainer.element.nativeElement.disabled = true;
    //     } else {
    //       this.viewContainer.element.nativeElement.remove();
    //     }
    //   }
    // }
  }
}
