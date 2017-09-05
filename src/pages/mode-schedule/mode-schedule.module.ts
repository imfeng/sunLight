import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ModeSchedulePage } from './mode-schedule';

import { ChartsModule } from 'ng2-charts';

import * as subMain from './nav-main'

@NgModule({
  declarations: [
    ModeSchedulePage,

    subMain.pr1patternsNav,
    subMain.pr2ModesNav
    
  ],
  imports: [
    IonicPageModule.forChild(ModeSchedulePage),
    ChartsModule
  ],
  entryComponents:[
    ModeSchedulePage,
    subMain.pr1patternsNav,
    subMain.pr2ModesNav
  ],
})
export class ModeSchedulePageModule {}
