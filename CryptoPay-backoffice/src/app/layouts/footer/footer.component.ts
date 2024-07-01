import { Component, OnInit, AfterViewInit } from '@angular/core';
import { LayoutService } from 'src/app/_metronic/core';
import KTLayoutFooter from 'src/assets/js/layout/base/footer';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: true,
  imports: [NgClass],
})
export class FooterComponent implements OnInit, AfterViewInit {
  footerContainerCSSClasses!: string;
  currentYear: string;

  constructor(private layout: LayoutService) {
    const currentDate = new Date();
    this.currentYear = currentDate.getFullYear().toString();
  }

  ngOnInit(): void {
    this.footerContainerCSSClasses = this.layout.getStringCSSClasses('footer_container');
  }

  ngAfterViewInit() {
    // Init Footer
    KTLayoutFooter.init('kt_footer');
  }
}
