import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EyeCheckPage } from './eye-check';
import { EyeCheckControl } from './eye-check.control'
import { LightsInfoModule } from '../../providers/lights-info/lights-info.module';
@NgModule({
  declarations: [
    EyeCheckPage,
  ],
  entryComponents: [
    EyeCheckPage,
  ],
  imports: [
    LightsInfoModule.forRoot(),
    IonicPageModule.forChild(EyeCheckPage),
  ],
  providers: [
    EyeCheckControl,
  ]

})
export class EyeCheckPageModule {}
