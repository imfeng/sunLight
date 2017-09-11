import { Component } from '@angular/core';
import { ModalController, NavController,NavParams } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { IonicPage } from 'ionic-angular';  // LazyLoading
import { BleOperatorPage } from '../ble-operator/ble-operator';


import { LightsInfoProvider } from  '../../providers/lights-info/lights-info'
@IonicPage()
@Component({
  selector: 'page-mode-manual',
  templateUrl: 'mode-manual.html',
})
export class ModeManual {
  deviceMeta : object = {
    groups : [1,2],
    curType : 1,
    curMultiple:0, 
  };
  lightsType : Array<object>;
  lightsGroups : Array<object>=[
    {'id':1,'name':'測試'}
  ];
  constructor(
    public modalCtrl: ModalController,
    private lightsInfo: LightsInfoProvider,
    public navCtrl: NavController,
    public navParams: NavParams,
    public toastCtrl:ToastController) {
    
  // 
  }
  ngOnInit() {
    this.lightsType = this.lightsInfo.getTypes();
  }
  openBleModal(){
    let modal = this.modalCtrl.create(BleOperatorPage);
    modal.present();
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad ModeManual');
  }
  test(){
    console.log(this.deviceMeta);
  }
}
