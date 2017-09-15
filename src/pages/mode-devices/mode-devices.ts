import { Component } from '@angular/core';
import { ModalController,IonicPage, NavController, NavParams } from 'ionic-angular';
import { BleOperatorPage } from '../ble-operator/ble-operator';
import { DevicesDataProvider,lightDeviceType } from '../../providers/devices-data/devices-data';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import { Observable } from 'rxjs/Observable';
@IonicPage()
@Component({
  selector: 'page-mode-devices',
  templateUrl: 'mode-devices.html',
})
export class ModeDevicesPage {
  devices_list:Observable<lightDeviceType[]>;
  
  constructor(
    private devicesProv:DevicesDataProvider,    
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    public navParams: NavParams) {
      this.devices_list = this.devicesProv.list;
      
  }

  editDevice(idx:number){
    this.navCtrl.push(editDevicePage, { "idx":idx });
  }
  openBleModal(){
    let modal = this.modalCtrl.create(BleOperatorPage);
    modal.present();
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad ModeDevicesPage');
  }
}

@Component({
  templateUrl: 'edit-device.html'
})
export class editDevicePage {

}
