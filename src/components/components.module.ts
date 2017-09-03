import { NgModule } from '@angular/core';
import { ToastCtrlComponent } from './toast-ctrl/toast-ctrl';
import { NumberPickerComponent } from './number-picker/number-picker';
@NgModule({
	declarations: [ToastCtrlComponent,
    NumberPickerComponent],
	imports: [],
	exports: [ToastCtrlComponent,
    NumberPickerComponent]
})
export class ComponentsModule {}
