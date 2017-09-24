import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { editDeviceSyncPage,SyncPage } from './sync';

@NgModule({
  declarations: [
    SyncPage,
    editDeviceSyncPage
  ],
  imports: [
    IonicPageModule.forChild(SyncPage),
  ],
  entryComponents: [
    editDeviceSyncPage

  ],
})
export class SyncPageModule {}
