import { NgModule } from '@angular/core';
import { ToastCtrlComponent } from './toast-ctrl/toast-ctrl';
import { NumberPickerComponent } from './number-picker/number-picker';
import { LightsChartComponent } from './lights-chart/lights-chart';
@NgModule({
	declarations: [ToastCtrlComponent,
    NumberPickerComponent,
    LightsChartComponent],
	imports: [],
	exports: [ToastCtrlComponent,
    NumberPickerComponent,
    LightsChartComponent]
})
export class ComponentsModule {}
