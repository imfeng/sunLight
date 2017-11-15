import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ModeSchedulePage } from './mode-schedule';
import { ChartsModule } from 'ng2-charts';
import { editSchedulePage,modalSectionEdit } from './edit-schedule';
import { LightsChartComponent } from '../../components/lights-chart/lights-chart';
import { LightsInfoModule } from '../../providers/lights-info/lights-info.module';
import { CollectionsModule } from '../../providers/collections-data/collections-data.module';
@NgModule({
  declarations: [
    ModeSchedulePage,
    LightsChartComponent,
    editSchedulePage,
    modalSectionEdit
  ],
  imports: [
    CollectionsModule,
    LightsInfoModule.forRoot(),
    IonicPageModule.forChild(ModeSchedulePage),
    ChartsModule,

  ],
  exports:[
    LightsChartComponent,    
  ],
  entryComponents:[
    editSchedulePage,
    modalSectionEdit
  ],
})
export class ModeSchedulePageModule {}
