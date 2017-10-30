import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { DevMode } from '../dev-mode/dev-mode';
import { ModeManual } from '../mode-manual/mode-manual';
import { ModeDevicesPage } from '../mode-devices/mode-devices';
import { ModeSchedulePage } from '../mode-schedule/mode-schedule';
import { CollectionsPage } from '../collections/collections';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  defaultIndex = 0;

  tab1Root = ModeSchedulePage;
  tab2Root = ModeManual;
  tab3Root = ModeDevicesPage;
  tab4Root = DevMode;

  tab5Root = CollectionsPage;

  constructor( private navParams: NavParams ) {
    this.defaultIndex = navParams.get("index") || 0;
  }
}
