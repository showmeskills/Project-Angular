import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { UserAssetsService } from './user-assets.service';

@Component({
  selector: 'app-user-assets',
  templateUrl: './user-assets.component.html',
  styleUrls: ['./user-assets.component.scss'],
})
export class UserAssetsComponent implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userAssetsService: UserAssetsService,
    private localStorageService: LocalStorageService,
    private appService: AppService
  ) {}

  static _componentName = 'UserAssetsComponent';

  ngOnInit() {}
}
