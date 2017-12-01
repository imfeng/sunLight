import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ModeManual } from './mode-manual';

import { BleOperatorPageModule } from '../ble-operator/ble-operator.module';
import { LightsInfoModule } from '../../providers/lights-info/lights-info.module';

//import { CollectionsCheckComponent } from '../../components/collections-check/collections-check';

@NgModule({
  declarations: [
    //CollectionsCheckComponent,
    ModeManual,
  ],
  imports: [
    LightsInfoModule.forRoot(),
    BleOperatorPageModule,
    IonicPageModule.forChild(ModeManual),
  ],
})
export class ModeManualModule {}
