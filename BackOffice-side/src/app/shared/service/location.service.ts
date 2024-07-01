import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  constructor(
    private location: Location,
    private router: Router
  ) {}

  back() {
    history.length > 1 ? this.location.back() : this.router.navigate(['/']);
  }
}
