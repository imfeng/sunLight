import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LightsInfoModule } from '../../providers/lights-info/lights-info.module';
import * as subMain from './nav-main'

@NgModule({
  declarations: [
    subMain.pr1patternsNav,
    subMain.pr2ModesNav,
    subMain.modalSectionEdit
  ],
  imports: [
    IonicPageModule.forChild(subMain.pr1patternsNav),
    IonicPageModule.forChild(subMain.pr2ModesNav),
    LightsInfoModule
  ],
  entryComponents:[
    subMain.pr1patternsNav,
    subMain.pr2ModesNav,
    subMain.modalSectionEdit

  ],
})
export class NavMainModule {}
