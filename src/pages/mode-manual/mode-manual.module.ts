import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ModeManual } from './mode-manual';

import { BleOperatorPageModule } from '../ble-operator/ble-operator.module';
@NgModule({
  declarations: [
    ModeManual,
  ],
  imports: [
    BleOperatorPageModule,
    IonicPageModule.forChild(ModeManual),
  ],
})
export class ModeManualModule {}
