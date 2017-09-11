import { Component } from '@angular/core';
import { AlertController,ModalController,NavController } from 'ionic-angular';
import { LightsInfoProvider } from  '../../providers/lights-info/lights-info'

import { BleOperatorPage } from '../ble-operator/ble-operator';

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

  constructor(
    private alertCtrl:AlertController,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    private lightsInfo: LightsInfoProvider) {
    this.test = this.lightsInfo.getTypes();
  }
  openBleModal(){
    let modal = this.modalCtrl.create(BleOperatorPage);
    modal.present();
  }
  openFanModal(){

  }
  devModeSetting(){
    let alert = this.alertCtrl.create({
      cssClass: 'devModeSetting',
      title: '亮度管理',
      message: '選擇需要的亮度階數 或 增加當前設定',
      inputs: [
        {
          name: '自訂2',
          type: 'radio',
          label: '10,20,50,100,90,10,50,10,10,60,10,20',
          value: '10,20,50,100,90,10,50,10,10,60,10,20',
        },
        {
          name: '自訂2',
          type: 'radio',
          label: '20,20,50,30,90,10,50,10,10,60,10,20',
          value: '30,20,50,30,90,10,50,10,10,60,10,20',
        },
      ],
      buttons: [
        {
          text: '使用',
          handler: () => {
            console.log('選擇 clicked');
          }
        },
        {
          text: '增加當前的設定值',
          handler: () => {
            console.log('儲存 clicked');
          }
        },
        {
          text: 'Cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },

      ]
    });

    alert.present();
  }
  onNumberChanged(event){
    console.log(event);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DevMode');
    console.log(this.lightDataForWheel);
  }

}
