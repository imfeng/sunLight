import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ModeDevicesPage,editDevicePage } from './mode-devices';
import { CollectionsModule } from '../../providers/collections-data/collections-data.module';
@NgModule({
  declarations: [
    ModeDevicesPage,
    editDevicePage,
  ],
  imports: [
    CollectionsModule,
    IonicPageModule.forChild(ModeDevicesPage),
  ],
  entryComponents:[
    editDevicePage
  ],
})
export class ModeDevicesPageModule {}
