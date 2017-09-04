import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ModeSchedulePage } from './mode-schedule';

@NgModule({
  declarations: [
    ModeSchedulePage,
  ],
  imports: [
    IonicPageModule.forChild(ModeSchedulePage),
  ],
})
export class ModeSchedulePageModule {}
