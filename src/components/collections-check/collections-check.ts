import { Component, ViewChildren, QueryList } from '@angular/core';
import { Checkbox } from 'ionic-angular';  // LazyLoading

@Component({
  selector: 'collections-check',
  templateUrl: 'collections-check.html'
})
export class CollectionsCheckComponent {
  @ViewChildren('imageSrc') ionCheckbox :QueryList<Checkbox>;
  collectionsListTest = Array.from({length: 12}, 
    (v, i) => ({
        "name":(i+1),
        "cid": (i+1),
        "devices":[]
      })
  );
  collectionsChecks:Array<boolean> = Array.from({length:12},v=>false);
  ionViewDidLoad(){
    console.log('===========');
    console.log(this.ionCheckbox);

    this.ionCheckbox.forEach((e,i) => {
      //console.log(   );
      e._elementRef.nativeElement.lastChild.firstChild.innerHTML = String.fromCharCode(65+i);
    });
  }

  constructor() {
    console.log('CollectionsCheckComponent');
    console.log('===========');
    console.log(this.ionCheckbox);
  }

}
