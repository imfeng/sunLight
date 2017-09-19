import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DevMode,editDevSettingPage } from './dev-mode';
import { NumberPickerComponent } from '../../components/number-picker/number-picker';

@NgModule({
  declarations: [
    DevMode,
    NumberPickerComponent,
    editDevSettingPage,
  ],
  imports: [
    IonicPageModule.forChild(DevMode),
  ],
  exports:[
    NumberPickerComponent,    
  ],
  bootstrap:[ DevMode, ],
  entryComponents: [
    editDevSettingPage,
  ]
})
export class DevModeModule {}
