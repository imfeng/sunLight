import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ModeSchedulePage } from './mode-schedule';
import { ChartsModule } from 'ng2-charts';
import {NavMainModule} from './nav-main.module'
import { LightsChartComponent } from '../../components/lights-chart/lights-chart';
@NgModule({
  declarations: [
    ModeSchedulePage,
    LightsChartComponent,

  ],
  imports: [
    IonicPageModule.forChild(ModeSchedulePage),
    NavMainModule,
    ChartsModule
  ],
  exports:[
    LightsChartComponent,    
  ],
  entryComponents:[
    
  ],
})
export class ModeSchedulePageModule {}
