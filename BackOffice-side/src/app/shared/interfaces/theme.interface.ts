/**
 *
 */
export interface CategoryParams {
  label: string;
  nameCn: string;
  nameEn: string;
}
/**
 *
 */
export interface CategoryItem {
  id: string;
  label: string;
  nameCn: string;
  nameEn: string;
}

export interface subjectParams {
  categoryId: string; //类别iD
  id?: string;
  label: string;
  nameCn: string;
  nameEn: string;
}
