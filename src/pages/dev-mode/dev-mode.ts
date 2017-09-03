import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { LightsInfoProvider } from  '../../providers/lights-info/lights-info'

import { WheelSelector } from '@ionic-native/wheel-selector';


@Component({
  selector: 'page-dev-mode',
  templateUrl: 'dev-mode.html',
})
export class DevMode {
  test : any;
  lightDataForWheel : Array<object>= Array.from( new Array(101),((val,index) => ({'description':index})));
  lightLine : object = {
    0:0,
    1:0,
    2:0,
    3:0,
    4:0,
    5:0,
    6:0,
    7:0,
    8:0,
    9:0,
    10:0,
    11:0,
    12:0,
  }
  constructor(private numSelector: WheelSelector, public navCtrl: NavController, private lightsInfo: LightsInfoProvider) {
    this.test = lightsInfo.getTypes();
  }

  selectANumber() {
    this.numSelector.show({
      title: "How Many?",
      items: [
        this.lightDataForWheel
      ],
    }).then(
      result => {
        console.log(result[0].description + ' at index: ' + result[0].index);
      },
      err => console.log('Error: ', err)
      );
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad DevMode');
    console.log(this.lightDataForWheel);
  }

}
