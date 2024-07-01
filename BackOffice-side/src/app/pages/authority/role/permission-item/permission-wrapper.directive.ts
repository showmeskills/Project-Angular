import { ContentChildren, Directive, QueryList } from '@angular/core';
import { PermissionItemComponent } from 'src/app/pages/authority/role/permission-item/permission-item.component';

@Directive({
  selector: '[permissionWrapper]',
  exportAs: 'permissionWrapper',
  standalone: true,
})
export class PermissionWrapperDirective {
  @ContentChildren(PermissionItemComponent, { descendants: true })
  permissionItemComponents: QueryList<PermissionItemComponent>;

  constructor() {}

  /**
   * 更新所有子集勾选
   * @param checked
   */
  public updateAllCheck(checked: boolean): void {
    console.log(this.permissionItemComponents);
    this.permissionItemComponents.toArray().forEach((e) => e.updateChecked(checked));
  }
}
