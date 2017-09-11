import { Injectable,NgZone } from '@angular/core';
import { Platform,ToastController, LoadingController } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';
import { NativeStorage } from '@ionic-native/native-storage';
import { AndroidPermissions } from '@ionic-native/android-permissions';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/observable/fromPromise';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

const _LIGHTS_SERVICE_UUID = '0000fff0-0000-1000-8000-00805f9b34fb';
const _LIGHTS_CHAR_UUID = '0000fff3-0000-1000-8000-00805f9b34fb';

/*
  Generated class for the BleCtrlProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
export interface lightsDevice {
  "name": string,
  "slug": string,  //customize name
  "address": string,
  "peripheral": any
  
}
interface nowStatus {
  "useable": boolean,
  "statusMessage": string,
  "isEnabled": boolean,
  "isConnected": boolean,
  "isDiscovered": boolean,
  "isSearching": boolean,
  "peripheral": any,
}
@Injectable()
export class BleCtrlProvider {
  private _loadingObj : any;
  nowStatus:Observable<nowStatus>;
  private _nowStatus:BehaviorSubject<nowStatus>;

  dataStore: nowStatus;
  lightsDevicesList: Array<lightsDevice>;
  scanedDevices:{
    "list": Array<object>
  };
  /*
  {
    "name": "TI SensorTag",
    "id": "BD922605-1B07-4D55-8D09-B66653E51BBA",
    "rssi": -79,
    "advertising": /* ArrayBuffer or map 
  }
  */

  constructor(
    
    private androidPermissions: AndroidPermissions,
    private ble: BLE,
    private storage: NativeStorage,
    private ngZone: NgZone,
    public loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private platform:Platform) {
      console.log('>>>>>>>>>>>>>>>>>>>>>>BleCtrlProvider');
    this.scanedDevices = {
      "list":[]
    };
    this.lightsDevicesList = []; 
    this._nowStatus = <BehaviorSubject<nowStatus>>new BehaviorSubject({});
    this.nowStatus = this._nowStatus.asObservable();
    this.dataStore = {
        "useable": false,
        "statusMessage": "initialized...",
        "isEnabled": false,
        "isConnected": false,
        "isDiscovered": false,
        "isSearching": false,
        "peripheral": {
          "name": "無裝置",
          "slug": "無裝置",
          "id": null,
        },
    };

    this.platform.ready().then(ready=>{
      this.androidPermissions.requestPermissions(
        [this.androidPermissions.PERMISSION.BLUETOOTH,
          this.androidPermissions.PERMISSION.BLUETOOTH_ADMIN,
          this.androidPermissions.PERMISSION.BLUETOOTH_PRIVILEGED,
          this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION,
          this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION ]);
      this.isEnbled();
    });
  }
  private _checkUseable(){
    if(this.dataStore["isEnabled"]&&this.dataStore["isConnected"]&&this.dataStore["isDiscovered"]){
      this.dataStore["useable"] = true;
    }else{
      this.dataStore["useable"] = false;
    }
    this._nowStatus.next(this.dataStore);
  }
  private _change(idx:string,value:any){
    this.dataStore[idx]=value;
    this._checkUseable();
  }
  /** BLE TURN series */
  isEnbled(){
    Observable.fromPromise(this.ble.isEnabled()).subscribe(
      ()=>{this._change("isEnabled",true)},
      ()=>{this._change("isEnabled",false)}
    );
  }
  enableBle() {
    let ob = Observable.fromPromise(this.ble.enable())
    ob.take(1).subscribe(
      ()=>{
        this._change("isEnabled",true);
        this._setStatus('成功開啟藍芽！');
      },
      err=>{
        alert('無法開啟藍芽...');
        this.ngZone.run(() => {
          this.dataStore.isEnabled = false;
          //this._change("isEnabled",false);
        });
        console.log('>>> Ble Enabled Failed!');
        console.log(JSON.stringify(err));
      }
    );
    return ob;
  }
  disableBle(){
    alert('請使用手機系統的設定自行關閉唷');
  }
  /** SCAN series */
  scan(sec=8){
    let time = this._presentLoading();
    this.scanedDevices["list"] = [];
    this.ble.scan([], sec).subscribe(
      device => {this._onDeviceDiscovered(device);this._dismissLoading(time);},
      error => {this._showError(error,'掃描藍芽裝置時發生錯誤。');this._dismissLoading(time);}
    );
    setTimeout(this._setStatus.bind(this), 1000*sec, '掃描完成......');
  }

  private _onDeviceDiscovered(device) {
    console.log('Discovered ' + JSON.stringify(device, null, 2));
    this.ngZone.run(() => {
      this.scanedDevices["list"].push(device);
    });
  }
  /** CONNECT DEVICE series */
  connectDevice(deviceId){
    let time = this._presentLoading();
    this.ble.connect(deviceId).subscribe(
      peripheral => {this._onConnected(peripheral);this._dismissLoading(time);},
      peripheral => {this._onDeviceDisconnected();this._dismissLoading(time);}
    );
  }
  disConnectDevice(deviceId){
    Observable.fromPromise(this.ble.disconnect(deviceId))
    .subscribe(
      () => {
        this._onDeviceDisconnected();
      },
      err => {this._showError(err,'中斷連線時發生錯誤！');}
    );
  }
  private _onConnected(peripheral): void {
    this.ngZone.run(() => {
      this._change("isConnected",true);
      this._change("peripheral",peripheral);
      alert('連線成功！');
      this._setStatus('連線成功！');
    });
  }

  private _onDeviceDisconnected(): void {
    this._change("isConnected",false);
    /*let toast = this.toastCtrl.create({
      message: '連線中斷！',
      duration: 3000,
      position: 'middle'
    });
    toast.present();*/
  }
  /** */
  write(value:Uint8Array){
    console.log('=== CMD VALUE ===');
    console.log(value);
    console.log('======');
    //new Uint8Array(*).buffer
    let time = this._presentLoading();    
    Observable.fromPromise(
      this.ble.write(
        this.dataStore.peripheral["id"],
        _LIGHTS_SERVICE_UUID,
        _LIGHTS_CHAR_UUID,
        value.buffer
      )).subscribe(
        scc => {this._setStatus('傳送成功！');this._dismissLoading(time);},
        err => {this._showError(err,'傳送失敗');this._dismissLoading(time);}
      );
  }
  /* */
  private waitLoading(message){
    this._presentLoading();
  }
  private _presentLoading() {
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();
    this._loadingObj = loading;
    let time = setTimeout(()=>{
      alert('逾時');
      loading.dismiss();
    }, 1000*20);
    return time;
    /*
      setTimeout(() => {
        loading.dismiss();
      }, 5000); */
  }
  private _dismissLoading(time){
    if(this._loadingObj){
      clearTimeout(time);
      this._loadingObj.dismiss();
    }
  }
  
  private _setStatus(message) {
    this.ngZone.run(() => {
      this.dataStore["statusMessage"] = message;
    });
  }
  private _showError(error,message) {
    this._setStatus('Error ' + error);
    console.log('>>> scanError() ');
    console.log(JSON.stringify(error));
    let toast = this.toastCtrl.create({
      message: message +' '+JSON.stringify(error),
      position: 'bottom',
      duration: 5000
    });
    toast.present();
  }
}
