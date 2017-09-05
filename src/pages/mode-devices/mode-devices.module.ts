import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ModeDevicesPage } from './mode-devices';

@NgModule({
  declarations: [
    ModeDevicesPage,
  ],
  imports: [
    IonicPageModule.forChild(ModeDevicesPage),
  ],
})
export class ModeDevicesPageModule {}
