import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ModeSchedulePage } from './mode-schedule';

import { ChartsModule } from 'ng2-charts';

import {NavMainModule} from './nav-main.module'

@NgModule({
  declarations: [
    ModeSchedulePage,


  ],
  imports: [
    IonicPageModule.forChild(ModeSchedulePage),
    NavMainModule,
    ChartsModule
  ],
  entryComponents:[
    ModeSchedulePage,

  ],
})
export class ModeSchedulePageModule {}
