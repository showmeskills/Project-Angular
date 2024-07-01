import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-customize-form-group',
  templateUrl: './customize-form-group.component.html',
  styleUrls: ['./customize-form-group.component.scss'],
})
export class CustomizeFormGroupComponent implements OnInit {
  constructor() {}

  @Input() column: boolean = false;
  @Input() marginBottom!: string;
  @Input() marginTop!: string;
  @Input() marginLeft!: string;
  @Input() marginRight!: string;

  ngOnInit() {}
}
