import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TabsPage } from './tabs';

import { DevModeModule } from '../dev-mode/dev-mode.module';
import { ModeSchedulePageModule } from '../mode-schedule/mode-schedule.module';
import { ModeManualModule } from '../mode-manual/mode-manual.module';
import { ModeDevicesPageModule } from '../mode-devices/mode-devices.module';
import { StartPageModule } from '../start/start.module';
import { CollectionsPageModule } from '../collections/collections.module';

@NgModule({
  declarations: [
    TabsPage,
  ],
  imports: [
    StartPageModule,
    DevModeModule,
    ModeSchedulePageModule,
    ModeManualModule,
    ModeDevicesPageModule,
    CollectionsPageModule,
    
    IonicPageModule.forChild(TabsPage),
  ],
})
export class TabsPageModule {}
