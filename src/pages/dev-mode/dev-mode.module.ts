import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DevMode } from './dev-mode';

@NgModule({
  declarations: [
    DevMode,
  ],
  imports: [
    IonicPageModule.forChild(DevMode),
  ],
  bootstrap:[ DevMode, ],
  entryComponents: []
})
export class DevModeModule {}
