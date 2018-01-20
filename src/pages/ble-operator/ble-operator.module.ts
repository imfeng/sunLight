import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BleOperatorPage,bleListPage } from './ble-operator';
import { CollectionsModule } from '../../providers/collections-data/collections-data.module';

@NgModule({
  declarations: [
    BleOperatorPage,
    bleListPage
  ],
  imports: [
    CollectionsModule,
    IonicPageModule.forChild(BleOperatorPage),
  ],
  entryComponents: [
    BleOperatorPage,
    bleListPage
  ] 
})
export class BleOperatorPageModule {}
