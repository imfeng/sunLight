import { OnInit,NgZone, ViewChild, Component } from '@angular/core';
import { ToastController, Content, Refresher,NavController, Platform, IonicPage, NavParams,ViewController } from 'ionic-angular';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { BLE } from '@ionic-native/ble';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/observable/fromPromise';
import { Observable } from 'rxjs/Observable';

import { BleCtrlProvider } from '../../providers/ble-ctrl/ble-ctrl';
/**
 * Generated class for the BleOperatorPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-ble-operator',
  templateUrl: 'ble-operator.html',
})
export class BleOperatorPage implements OnInit{
  blueInfo : object = {
    'enabled' : false
  }
  that =this;
  constructor(
    private androidPermissions: AndroidPermissions,
    private bleCtrl:BleCtrlProvider,
    public platform: Platform,
    public viewCtrl: ViewController,
    public navCtrl: NavController,
    public navParams: NavParams,) {
    console.log(this.navParams.data);
    this.platform.ready().then(ready=>{
      
          Observable.fromPromise(this.ble.isEnabled()).take(1).subscribe(
            ()=>{this.setBleInfo(true)},
            ()=>{this.setBleInfo(true)}
          );
      
    });
  }
  ngOnInit(){
  }
  setBleInfo(s:boolean){
    this.blueInfo['enabled'] = s;
  }
  enableBl() {
    if (this.blueInfo['enabled']) {
      this.platform.ready().then(ready=>{
        this.ble.enable().then(function(scc){
          console.log('>>> Ble Enabled!');
        },function(err){
          this.setBleInfo(false);
          console.log('>>> Ble Enabled Failed!');
          console.log(JSON.stringify(err));
        });
      });
    }else{}
  }
  openBleListNav(item){
    this.navCtrl.push(bleListPage, { item: item });
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad BleOperatorPage');
  }
  dismiss() {
    this.viewCtrl.dismiss();
  }
}
@Component({
  templateUrl: 'ble-list.html',
})
export class bleListPage implements OnInit{
  item;
  devices: any[] = [];
  statusMessage: string;
  peripheral: any;

  @ViewChild(Content) content: Content;
  @ViewChild(Refresher) refresher: Refresher;

  constructor(
    private androidPermissions: AndroidPermissions,
    private ngZone: NgZone,
    private toastCtrl: ToastController,
    private ble: BLE,
    public platform: Platform,
    private params: NavParams) {
    this.item = this.params.data.item;
    this.platform.ready().then(ready=>{
      this.androidPermissions.requestPermissions(
        [this.androidPermissions.PERMISSION.BLUETOOTH,
          this.androidPermissions.PERMISSION.BLUETOOTH_ADMIN,
          this.androidPermissions.PERMISSION.BLUETOOTH_PRIVILEGED,
          this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION,
          this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION ]);

      /* HACK refresher EVENT */
      this.refresher._top = this.content.contentTop + 'px';
      this.refresher.state = 'ready';
      this.refresher._onEnd();
      
    });
    
  }
  ngOnInit(){

  }
  ionViewDidEnter() {

  }

  connetDevice(deviceId){
    this.ble.connect(deviceId).subscribe(
      peripheral => this._onConnected(peripheral),
      peripheral => this._onDeviceDisconnected(peripheral)
    );
  }
  private _onConnected(peripheral): void {
    this.ngZone.run(() => {
      this.setStatus('連線中...');
      this.peripheral = peripheral;
    });
  }

  private _onDeviceDisconnected(peripheral): void {
    let toast = this.toastCtrl.create({
      message: '連線中斷！',
      duration: 3000,
      position: 'middle'
    });
    toast.present();
  }
  /* */
  scan(){
    let sec = 8;
    this.ble.scan([], sec).subscribe(
      device => this.onDeviceDiscovered(device),
      error => this.scanError(error)
    );
    // '65A6F614-2738-4BB9-B1EC-2CF5D062367C'
    
    setTimeout(this.setStatus.bind(this), 1000*sec);
    
  }
  onDeviceDiscovered(device) {
    console.log('Discovered ' + JSON.stringify(device, null, 2));
    this.ngZone.run(() => {
      if(device.address){
        this.devices.push(device);
      }
      
    });
  }
  setStatus(message) {
    console.log('message:');
    console.log(message);
    this.ngZone.run(() => {
      this.statusMessage = message;
    });
  }
  doRefresh(refresher) {
    console.log('Begin async operation', refresher);
    this.scan();

    setTimeout(() => {
      console.log('Async operation has ended');
      refresher.complete();
    }, 2000);
  }

    // If location permission is denied, you'll end up here
    scanError(error) {
      this.setStatus('Error ' + error);
      console.log('>>> scanError() ');
      console.log(JSON.stringify(error));
      let toast = this.toastCtrl.create({
        message: 'Error scanning for Bluetooth LE devices',
        position: 'middle',
        duration: 5000
      });
      toast.present();
    }

}