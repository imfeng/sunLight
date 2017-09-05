import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { LightsInfoProvider } from  '../../providers/lights-info/lights-info'

import { WheelSelector } from '@ionic-native/wheel-selector';


@Component({
  selector: 'page-dev-mode',
  templateUrl: 'dev-mode.html',
})
export class DevMode {
  numTest: object = {'0':99};
  ggg: object = {value:1};
  testNumWheel : Function =function(){
    console.log('testNumWheel!');
  }
  test : any;
  lightDataForWheel : Array<object>= Array.from( new Array(101),((val,index) => ({'description':index})));
  lightLinesObj : object = {
    0:1,
    1:2,
    2:3,
    3:4,
    4:5,
    5:6,
    6:7,
    7:8,
    8:9,
    9:10,
    10:11,
    11:12
  }
  lightLinesArr : Array<object>= Array.from( new Array(12),((val,index) => ({'value':index+1}) )); // [1 to 12]

  constructor(private numSelector: WheelSelector, public navCtrl: NavController, private lightsInfo: LightsInfoProvider) {
    this.test = this.lightsInfo.getTypes();
  }

  onNumberChanged(event){
    console.log(event);
  }
  selectANumber() {
    console.log(this.lightLinesArr);
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
