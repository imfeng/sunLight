import { NgModule } from '@angular/core';
import { LightsInfoProvider,lightsTypesPipe } from './lights-info';

@NgModule({
  declarations: [
    lightsTypesPipe,
  ],
  exports: [
    lightsTypesPipe,
  ],
  imports: [],
  providers: [
    LightsInfoProvider
  ],
})
export class LightsInfoModule {
  static forRoot() {
    return {
        ngModule: LightsInfoModule,
        providers: [],
    };
 }
}
