import { Routes } from '@angular/router';
import { GroupComponent } from './group/group.component';
import { AddComponent as GroupAddComponent } from './group/add/add.component';
import { RoleComponent } from './role/role.component';
import { EditComponent as RoleEditComponent } from './role/edit/edit.component';
import { AccountManageComponent } from './account-manage/account-manage.component';

export const routes: Routes = [
  { path: '', redirectTo: 'group', pathMatch: 'full' },
  {
    path: 'group',
    component: GroupComponent,
    data: { name: '群组管理', code: '217', keep: true, lang: 'nav.groupManagement' },
  },
  {
    path: 'group/add',
    component: GroupAddComponent,
    data: {
      name: '新增群组',
      lang: 'breadCrumb.addGroup',
      breadcrumbsBefore: [{ name: '群组管理', link: '/authority/group', lang: 'nav.groupManagement' }],
    },
  },
  {
    path: 'group/:id',
    component: GroupAddComponent,
    data: {
      name: '编辑群组',
      lang: 'breadCrumb.editGroup',
      breadcrumbsBefore: [{ name: '群组管理', link: '/authority/group', lang: 'nav.groupManagement' }],
    },
  },
  {
    path: 'role',
    component: RoleComponent,
    data: { name: '角色管理', code: '216', keep: true, lang: 'nav.roleManagement' },
  },
  {
    path: 'role/groupRole/:id',
    component: RoleComponent,
    data: {
      name: '群组角色',
      lang: '',
      breadcrumbsBefore: [{ name: '角色管理', link: '/authority/role', lang: 'nav.roleManagement' }],
    },
  },
  {
    path: 'role/edit',
    component: RoleEditComponent,
    data: {
      name: '新增角色',
      lang: '',
      breadcrumbsBefore: [{ name: '角色管理', link: '/authority/role', lang: 'nav.roleManagement' }],
    },
  },
  {
    path: 'role/edit/:id',
    component: RoleEditComponent,
    data: {
      name: '编辑角色',
      lang: 'breadCrumb.editingRole',
      breadcrumbsBefore: [{ name: '角色管理', link: '/authority/role', lang: 'nav.roleManagement' }],
    },
  },
  {
    path: 'account-manage',
    component: AccountManageComponent,
    data: { name: '账户管理', code: '215' },
  },
  // {
  //   path: 'resource',
  //   component: ResourceComponent,
  //   data: { name: '资源管理', lang: 'breadCrumb.resourceManagement' },
  // },
];
