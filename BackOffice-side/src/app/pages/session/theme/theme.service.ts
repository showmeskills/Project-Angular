import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CategoryItem } from 'src/app/shared/interfaces/theme.interface';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  categoryList$: BehaviorSubject<CategoryItem[]> = new BehaviorSubject<CategoryItem[]>([]);
  delCategory$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
}
