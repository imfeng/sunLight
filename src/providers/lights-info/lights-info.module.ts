import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicPageModule } from 'ionic-angular';
import { LightsInfoProvider,lightsTypesPipe } from './lights-info';

@NgModule({
  declarations: [
    lightsTypesPipe,
  ],
  exports: [
    lightsTypesPipe,
  ],
    imports: [CommonModule],
  providers: [
    LightsInfoProvider,
    lightsTypesPipe
  ],
})
export class LightsInfoModule {}
