import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ModeDevicesPage,editDevicePage } from './mode-devices';

@NgModule({
  declarations: [
    ModeDevicesPage,
    editDevicePage
  ],
  imports: [
    IonicPageModule.forChild(ModeDevicesPage),
  ],
  entryComponents:[
    editDevicePage
  ],
})
export class ModeDevicesPageModule {}
