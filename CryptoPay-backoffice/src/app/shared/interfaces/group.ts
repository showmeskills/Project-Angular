import { BaseModel } from 'src/app/_metronic/shared/crud-table';
import { BaseInterface } from './base.interface';
import { CreateUserRoleParams } from 'src/app/shared/interfaces/role';

export interface Person extends BaseModel, BaseInterface {
  id: number;
  name: string;
}

export interface Group extends BaseModel, BaseInterface {
  id: number | undefined;
  groupName: string; // 群名
  supervisor: Person | undefined; // 主管
  roles: number[]; // 角色
  member: Person[]; // 成员
}

export interface CreateGroupParams extends BaseInterface {
  groupName: string;
  leaderId: number;
  remark: string;
  memberIds: Array<number>;
}

export interface UpdateGroupParams extends BaseInterface {
  groupId: number;
  groupName: string;
  leaderId: number;
  remark: string;
  groupUsers: number[];
  userRoles: CreateUserRoleParams[];
}

export interface CreateUserGroupParams extends BaseInterface {
  groupId: number;
  userId: number;
}
