import { NgModule } from '@angular/core';
import { devicesToStringPipe,DevicesDataProvider } from './devices-data';

@NgModule({
  declarations: [
    devicesToStringPipe,
  ],
  exports: [
    devicesToStringPipe,
  ],
  imports: [],
  providers: [
    DevicesDataProvider
  ],
})
export class devicesDataModule {
  static forRoot() {
    return {
        ngModule: devicesDataModule
    };
 }
}
