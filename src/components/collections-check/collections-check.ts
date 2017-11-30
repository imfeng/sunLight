import { Component } from '@angular/core';

/**
 * Generated class for the CollectionsCheckComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'collections-check',
  templateUrl: 'collections-check.html'
})
export class CollectionsCheckComponent {

  text: string;

  constructor() {
    console.log('Hello CollectionsCheckComponent Component');
    this.text = 'Hello World';
  }

}
