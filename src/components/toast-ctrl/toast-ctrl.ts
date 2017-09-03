import { Component } from '@angular/core';

/**
 * Generated class for the ToastCtrlComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'toast-ctrl',
  templateUrl: 'toast-ctrl.html'
})
export class ToastCtrlComponent {

  text: string;

  constructor() {
    console.log('Hello ToastCtrlComponent Component');
    this.text = 'Hello World';
  }

}
