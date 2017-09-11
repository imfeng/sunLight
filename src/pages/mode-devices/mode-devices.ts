import { Component } from '@angular/core';
import { ModalController,IonicPage, NavController, NavParams } from 'ionic-angular';
import { BleOperatorPage } from '../ble-operator/ble-operator';
/**
 * Generated class for the ModeDevicesPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-mode-devices',
  templateUrl: 'mode-devices.html',
})
export class ModeDevicesPage {

  constructor(public modalCtrl: ModalController,
    public navCtrl: NavController, public navParams: NavParams) {
  }
  openBleModal(){
    let modal = this.modalCtrl.create(BleOperatorPage);
    modal.present();
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad ModeDevicesPage');
  }

}
