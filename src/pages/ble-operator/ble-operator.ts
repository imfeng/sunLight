import { OnInit,NgZone, ViewChild, Component } from '@angular/core';
import { ToastController, Content, Refresher,NavController, Platform, IonicPage, NavParams,ViewController } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';

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
    private bl:BluetoothSerial,
    public platform: Platform,
    public viewCtrl: ViewController,
    public navCtrl: NavController,
    public navParams: NavParams) {
    console.log(this.navParams.data);
  }
  ngOnInit(){

  }
  setBleInfo(s:boolean){
    this.blueInfo['enabled'] = s;
    console.log(this.blueInfo['enabled']);
  }
  toggle(){
    this.blueInfo['enabled'] = !this.blueInfo['enabled'];
  }
  enableBl() {
    //console.log(this.blueInfo['enabled']);
    if (this.blueInfo['enabled']) {
      this.bl.enable().then(
        () => {
          console.log('enabled');
          console.log(this.blueInfo);
        },
        () => {
          console.log('NOT enabled');
          this.setBleInfo(false);
          console.log(this);
        }
      );
    }

  }

  
  openBleListNav(item){
    this.navCtrl.push(bleListPage, { item: item });
  }

  ionViewDidLoad() {
    this.blueInfo['enabled'] = true;
    console.log('ionViewDidLoad BleOperatorPage');
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
}
@Component({
  templateUrl: 'ble-list.html',
})
export class bleListPage {
  item;
  devices: any[] = [];
  statusMessage: string;

  @ViewChild(Content) content: Content;
  @ViewChild(Refresher) refresher: Refresher;

  constructor(
    private ngZone: NgZone,
    private toastCtrl: ToastController,
    private ble: BLE,

    private params: NavParams) {
    
    this.item = this.params.data.item;
  }
  scan(){
    this.setStatus('Scanning for Bluetooth LE Devices');
    this.devices = [];  // clear list

    this.ble.scan([], 5).subscribe(
      device => this.onDeviceDiscovered(device), 
      error => this.scanError(error)
    );

    setTimeout(this.setStatus.bind(this), 5000, 'Scan complete');
  }
  onDeviceDiscovered(device) {
    console.log('Discovered ' + JSON.stringify(device, null, 2));
    this.ngZone.run(() => {
      this.devices.push(device);
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
  ionViewDidEnter() {
    this.refresher._top = this.content.contentTop + 'px';
    this.refresher.state = 'ready';
    this.refresher._onEnd();
  }


    // If location permission is denied, you'll end up here
    scanError(error) {
      this.setStatus('Error ' + error);
      let toast = this.toastCtrl.create({
        message: 'Error scanning for Bluetooth LE devices',
        position: 'middle',
        duration: 5000
      });
      toast.present();
    }

}