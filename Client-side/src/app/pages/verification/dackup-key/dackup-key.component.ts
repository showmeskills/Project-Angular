import { Component, Input, OnInit } from '@angular/core';
import { GeneralService } from 'src/app/shared/service/general.service';

@Component({
  selector: 'app-dackup-key',
  templateUrl: './dackup-key.component.html',
  styleUrls: ['./dackup-key.component.scss'],
})
export class DackupKeyComponent implements OnInit {
  constructor(private generalService: GeneralService) {}

  @Input() googleValidekey: string = '';

  ngOnInit() {}
}
