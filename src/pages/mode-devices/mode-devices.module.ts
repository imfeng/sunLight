import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ModeDevicesPage,editDevicePage } from './mode-devices';
import { SyncPageModule } from '../sync/sync.module';
@NgModule({
  declarations: [
    ModeDevicesPage,
    editDevicePage,
  ],
  imports: [
    IonicPageModule.forChild(ModeDevicesPage),
    SyncPageModule
  ],
  entryComponents:[
    editDevicePage
  ],
})
export class ModeDevicesPageModule {}
