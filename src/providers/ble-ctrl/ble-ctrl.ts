import { Injectable,NgZone } from '@angular/core';
import { Platform,ToastController, LoadingController } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';
import { AndroidPermissions } from '@ionic-native/android-permissions';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/observable/fromPromise';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { DevicesDataProvider,lightDeviceType } from '../devices-data/devices-data'


const _LIGHTS_SERVICE_UUID = '0000fff0-0000-1000-8000-00805f9b34fb';
const _LIGHTS_CHAR_UUID = '0000fff3-0000-1000-8000-00805f9b34fb';
//7bb104bf-abf8-4a91-9385-9c3e07cf7c30
//b9403000-f5f8-466e-aff9-25556b57fe6d
//const _LIGHTS_SERVICE_UUID = 'b9406000-f5f8-466e-aff9-25556b57fe6d';
//const _LIGHTS_CHAR_UUID = 'b9406003-f5f8-466e-aff9-25556b57fe6d';
//const _LIGHTS_SERVICE_UUID = '19B10010-E8F2-537E-4F6C-D104768A1214';
//const _LIGHTS_CHAR_UUID    = '19B10011-E8F2-537E-4F6C-D104768A1214';
export interface lightsDevice {
  "name": string,
  "slug": string,  //customize name
  "address": string,
  "peripheral": any
  
}
export interface nowStatus {
  "hadConnected":boolean,
  "useable": boolean,
  "statusMessage": string,
  "isEnabled": boolean,
  "isConnected": boolean,
  "isDiscovered": boolean,
  "isSearching": boolean,
  "peripheral": any,
  "device":lightDeviceType
}
@Injectable()
export class BleCtrlProvider {
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
    private devicesData:DevicesDataProvider,
    private androidPermissions: AndroidPermissions,
    private ble: BLE,
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
        "hadConnected":true,
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
        "device":{
          "name":null,
          "o_name" :null,
          "id": null,
          "group":null,
          "last_sended": null
        }
    };

    this.platform.ready().then(ready=>{
      this.androidPermissions.requestPermissions(
        [this.androidPermissions.PERMISSION.BLUETOOTH,
          this.androidPermissions.PERMISSION.BLUETOOTH_ADMIN,
          this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION,
          this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION ]);
      this.isEnbled();
    });
  }

  private _change(idx:string,value:any){
    this.dataStore[idx]=value;
    //this._checkUseable();
    if(this.dataStore["isEnabled"]&&this.dataStore["isConnected"]){
      this.dataStore["useable"] = true;
    }else{
      this.dataStore["useable"] = false;
    }
    this._nowStatus.next(this.dataStore);
  }
  /** BLE TURN series */
  isEnbled(){
    Observable.fromPromise(this.ble.isEnabled()).subscribe(
      ()=>{this._change("isEnabled",true)},
      ()=>{this._change("isEnabled",false)}
    );
  }
  enableBle() {
    return Observable.create(
      observer => {
        Observable.fromPromise(this.ble.enable())
          .take(1).subscribe(
            ()=>{
              this._change("isEnabled",true);
              this._setStatus('成功開啟藍芽！');
              observer.next(true);
              observer.complete();
            },
            err=>{
              alert('無法開啟藍芽...');
              this.ngZone.run(() => {
                //this.dataStore.isEnabled = false;
                this._change("isEnabled",false);
              });
              console.log('>>> Ble Enabled Failed!');
              console.log(JSON.stringify(err));
              observer.error(false);
              observer.complete();
            }
          );
      }
    );

  }
  disableBle(){
    alert('請使用手機系統的設定自行關閉唷');
  }
  /** SCAN series */
  scan(sec=8,showLoading=true){
    let loadObj = this._presentLoading();
    this.scanedDevices["list"] = [];
    this._setStatus('掃描中');
    this.ble.scan([], sec).subscribe(
      device => {this._onDeviceDiscovered(device);
        if(showLoading) this._dismissLoading(loadObj);},
      error => {this._showError(error,'掃描藍芽裝置時發生錯誤。');this._dismissLoading(loadObj);}
    );
    setTimeout(this._setStatus.bind(this), 1000*sec, '掃描完成......');
  }

  private _onDeviceDiscovered(device) {
    //console.log('Discovered ' + JSON.stringify(device, null, 2));
    this.devicesData.check(device,false).subscribe(
      findDevice => {
        this.ngZone.run(() => {
          this.scanedDevices["list"].push(findDevice);
        });
      }
    );
  }
  /** CONNECT DEVICE series */
  connectDevice(deviceId,todoFn = (p=null)=>{}){
    let loadObj = this._presentLoading();
    this.ble.connect(deviceId).subscribe(
      peripheral => {
        setTimeout(()=>{
          let time = new Date();
          let data = new Uint8Array([0xfa,0xa0,time.getHours(),time.getMinutes(),time.getSeconds(),0xff]);
          this.write(data,()=>{
            this.showToast('已將裝置時間同步！');
          },()=>{},true);
        },2500);
        this._change("hadConnected",true);
        //console.log(JSON.stringify(peripheral));
        this.devicesData.check(peripheral,true).subscribe(
          device => {
            this.dataStore.device = device;
          }
        );
        this._onConnected(peripheral);this._dismissLoading(loadObj);todoFn(peripheral);},
      peripheral => {this._onDeviceDisconnected();this._dismissLoading(loadObj);}
    );
  }
  scanAndConnect(id:string,sec=6){  // ble-operator.ts
    let loadObj = this._presentLoading();
    this.scan(sec);
    setTimeout(
      ()=>{
        this.connectDevice(id);
        this._dismissLoading(loadObj);
      },1000*sec
    );
  }
  connectOnce(deviceId,sec=6){  // ble-command.ts
    return Observable.create(
      observer=>{
        let loadObj = this._presentLoading();
        this.scan(sec);
        setTimeout(
          ()=>{
            this.ble.connect(deviceId).take(1).subscribe(
              peripheral => {
                this._dismissLoading(loadObj);
                observer.next(true);
              },
              peripheral => {
                this._dismissLoading(loadObj);
                observer.next(false);
              }
            );
          },1000*sec
        );
      }
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
      alert('連線成功！');
      this._change("isConnected",true);
      this._change("peripheral",peripheral);
      this._setStatus('連線成功！');
    });
  }

  private _onDeviceDisconnected(): void {
    this._change("isConnected",false);
    let toast = this.toastCtrl.create({
      message: '連線中斷！',
      duration: 1500,
      position: 'bottom'
    });
    toast.present();
  }
  /** */

  checkConnect(id){
    return Observable.create(
      observer=>{
        this.nowStatus.take(1).subscribe(
          now =>{
            if(now.hadConnected){
              Observable.fromPromise(this.ble.isConnected(id)).subscribe(
                ()=>{
                  observer.next(true);observer.complete();
                },
                ()=>{
                  this.ble.connect(id).take(1).subscribe(
                    peripheral => {
                      console.log('重新連線成功！！');
                      observer.next(true);observer.complete();
                    },
                    peripheral => {this._onDeviceDisconnected();alert('無法重新連結到剛才的裝置，請確認裝置是否在附近');observer.error(peripheral);}
                  );
                }
              );
            }else{
              alert('請先與裝置連線！');
              observer.error(true);observer.complete();
            }
            
          }
        );
        

      }
    );

  }
  write_many_go(observer,cmds:Uint8Array[],idx,isOk:boolean[],loadObj){
    Observable.fromPromise(
      this.ble.writeWithoutResponse(
        this.dataStore.peripheral.id,
        _LIGHTS_SERVICE_UUID,
        _LIGHTS_CHAR_UUID,
        cmds[idx].buffer
      )).subscribe(
        scc => {
          idx++;
          isOk.push(true);
          if(idx>cmds.length-1){  //傳送結束
            this._dismissLoading(loadObj);
            observer.next(isOk);
            observer.complete();
          }else{
            this.write_many_go(observer,cmds,idx,isOk,loadObj);
          }
        },
        err => {
          console.log(' write ERROR!!!!!!!!!!!!!!!!!!!!!!!!!');
          console.log(JSON.stringify(err));
          idx++;
          isOk.push(false);
          if(idx>cmds.length-1){  //傳送結束
            this._dismissLoading(loadObj);
            observer.next(isOk);
            observer.complete();
          }else{
            this.write_many_go(observer,cmds,idx,isOk,loadObj);
          }
        }
      );
  }
  write_many(value:Uint8Array[]){
    console.log('=== CMD VALUE ===');
    console.log(JSON.stringify(value));
    console.log('======');
    return Observable.create(
      observer=>{
        let loadObj = this._presentLoading();
        
        this.checkConnect(this.dataStore.device.id).subscribe(
          ()=>{
            this.write_many_go(observer,value,0,[],loadObj);
          },()=>{this._dismissLoading(loadObj);}
        );
      }
    );
  }
  write(value:Uint8Array,sccFn=(id)=>{},errFn=(id)=>{},toBack=false,deviceId=this.dataStore.device.id){
    let loadObj = this._presentLoading();
    console.log('=== CMD VALUE ===');
    console.log(JSON.stringify(value));
    console.log('======');
    //new Uint8Array(*).buffer
    this.checkConnect(deviceId).subscribe(
      ()=>{
        Observable.fromPromise(
          this.ble.writeWithoutResponse(
            this.dataStore.peripheral.id,
            _LIGHTS_SERVICE_UUID,
            _LIGHTS_CHAR_UUID,
            value.buffer
          )).subscribe(
            scc => {
              if(toBack) sccFn(this.dataStore.peripheral.id);
              else this.showToast('傳送成功！');
              this._dismissLoading(loadObj);},
            err => {
              if(toBack) errFn(this.dataStore.peripheral.id);
              else this._showError(err,'傳送失敗');
              this._dismissLoading(loadObj);}
          );
      },()=>{this._dismissLoading(loadObj);}
    );
    /*Observable.fromPromise(this.ble.isConnected(this.dataStore.peripheral.id)).subscribe(
      ()=>{

      },
      ()=>{
        console.log('>>> RECONNECTED!!!!');
        this.ble.connect(this.dataStore.peripheral.id).take(1).subscribe(
          peripheral => {
            console.log('重新連線成功！！');
            Observable.fromPromise(
              this.ble.writeWithoutResponse(
                this.dataStore.peripheral.id,
                _LIGHTS_SERVICE_UUID,
                _LIGHTS_CHAR_UUID,
                value.buffer
              )).subscribe(
                scc => {
                  alert('傳送成功！');this._dismissLoading(time);},
                err => {
                  this._showError(err,'傳送失敗');this._dismissLoading(time);}
              );
          },
          peripheral => {this._onDeviceDisconnected();this._dismissLoading(time);}
        );
      }
    );*/

  }
  /* */
  private _presentLoading() {
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();
    let time = setTimeout(()=>{
      alert('逾時');
      loading.dismiss();
    }, 1000*12);
    return {
      "time":time,
      "loading":loading
    };
    /*
      setTimeout(() => {
        loading.dismiss();
      }, 5000); */
  }
  private _dismissLoading(loadObj){
    if(loadObj.loading){
      clearTimeout(loadObj.time);
      loadObj.loading.dismiss();
    }
  }
  
  private showToast(message=null){
    let toast = this.toastCtrl.create({
      message: message ,
      position: 'bottom',
      duration: 1000
    });
    toast.present();
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
