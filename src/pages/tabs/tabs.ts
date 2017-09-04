import { Component } from '@angular/core';

import { ContactPage } from '../contact/contact';

import { DevMode } from '../dev-mode/dev-mode';
import { ModeManual } from '../mode-manual/mode-manual';
import { ModeSchedulePage } from '../mode-schedule/mode-schedule';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = ModeSchedulePage;
  tab2Root = ModeManual;
  tab3Root = ContactPage;
  tab4Root = DevMode;

  constructor() {

  }
}
