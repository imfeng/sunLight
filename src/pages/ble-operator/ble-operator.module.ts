import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BleOperatorPage,bleListPage } from './ble-operator';

@NgModule({
  declarations: [
    BleOperatorPage,
    bleListPage
  ],
  imports: [
    IonicPageModule.forChild(BleOperatorPage),
  ],
  entryComponents: [
    BleOperatorPage,
    bleListPage
  ] 
})
export class BleOperatorPageModule {}
