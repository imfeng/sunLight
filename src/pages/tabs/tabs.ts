import { Component } from '@angular/core';

import { AboutPage } from '../about/about';
import { ContactPage } from '../contact/contact';
import { HomePage } from '../home/home';

import { DevMode } from '../dev-mode//dev-mode';
import { ModeManual } from '../mode-manual/mode-manual';


@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = ModeManual;
  tab3Root = ContactPage;
  tab4Root = DevMode;

  constructor() {

  }
}
