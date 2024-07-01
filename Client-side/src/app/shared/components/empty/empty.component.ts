import { Component, Input, OnInit } from '@angular/core';
import { LocaleService } from '../../service/locale.service';

@Component({
  selector: 'app-empty',
  templateUrl: './empty.component.html',
  styleUrls: ['./empty.component.scss'],
})
export class EmptyComponent implements OnInit {
  @Input() text: string = this.localeService.getValue('no_record');
  @Input() icon: string = 'assets/svg/data-empty.svg';
  @Input() smallText: boolean = false;

  constructor(private localeService: LocaleService) {}

  ngOnInit() {}
}
