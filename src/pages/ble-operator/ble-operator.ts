import { OnInit,NgZone, ViewChild, Component } from '@angular/core';
import { ToastController, Content, Refresher,NavController, Platform, IonicPage, NavParams,ViewController } from 'ionic-angular';
import { AndroidPermissions } from '@ionic-native/android-permissions';
//import { BLE } from '@ionic-native/ble';
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
  blueInfo : any;
  test = {
    "tog":false
  }
  constructor(
    private bleCtrl:BleCtrlProvider,
    public viewCtrl: ViewController,
    public navCtrl: NavController,
    public navParams: NavParams,) {
      console.log('>>>>>>>>>>>>>>>>>>>>>>BleOperatorPage');
      this.blueInfo = this.bleCtrl.dataStore;
  }
  ngOnInit(){
  }
  setBleInfo(s:boolean){
  }
  enableBle() {
    if(this.test.tog==true){
      //console.log(JSON.stringify(this.blueInfo));
      this.bleCtrl.enableBle().subscribe(
        ()=>{},
        ()=>{
          console.log('gg');
          
          this.blueInfo.isEnabled = false;
        }
      );
      this.test.tog = false;
    }

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
  devices: any;
  statusMessage: string;
  peripheral: any;
  blueInfo : object;
  @ViewChild(Content) content: Content;
  @ViewChild(Refresher) refresher: Refresher;

  constructor(
    public navCtrl: NavController,
    private androidPermissions: AndroidPermissions,
    private ngZone: NgZone,
    private toastCtrl: ToastController,
    private bleCtrl:BleCtrlProvider,
    //private ble: BLE,
    public platform: Platform,
    private params: NavParams) {
    this.item = this.params.data.item;
    this.platform.ready().then(ready=>{
      this.blueInfo = this.bleCtrl.dataStore;
      this.devices = this.bleCtrl.scanedDevices;
      if(this.blueInfo["isEnabled"]){
        this.doRefresh();
        /* HACK refresher EVENT */
        /*this.refresher._top = this.content.contentTop + 'px';
        this.refresher.state = 'ready';
        this.refresher._onEnd();*/
      }else{
        alert('請開啟藍芽才能正常運作唷～');
      }
    });
    
  }
  ngOnInit(){
  }
  ionViewDidEnter() {
  }

  connectDevice(deviceId){
    this.bleCtrl.connectDevice(deviceId);
    this.navCtrl.pop()
  }

  scan(){
    console.log(JSON.stringify(this.blueInfo));
    console.log(JSON.stringify(this.devices.list));
    this.bleCtrl.scan();
  }

  doRefresh() {
    this.scan();
    /*
    setTimeout(() => {
      console.log('Async operation has ended');
      refresher.complete();
    }, 2000);*/
  }

}