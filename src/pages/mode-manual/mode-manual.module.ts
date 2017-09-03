import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ModeManual } from './mode-manual';

@NgModule({
  declarations: [
    ModeManual,
  ],
  imports: [
    IonicPageModule.forChild(ModeManual),
  ],
})
export class ModeManualModule {}
