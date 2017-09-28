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

const _BLE_CONNECT_TIMEOUT = 20000;
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
  scanListStore : {
    "list":lightDeviceType[]
  }={
    "list":[]
  }
  private _scanListOb = <BehaviorSubject<lightDeviceType[]>>new BehaviorSubject([]);
  bleStatus : {
    "scanList": Observable<lightDeviceType[]>,
  }= {
    "scanList":this._scanListOb.asObservable()
  }
  nowStatus:Observable<nowStatus>;
  private _nowStatus:BehaviorSubject<nowStatus>;

  dataStore: nowStatus;
  lightsDevicesList: Array<lightsDevice>;
  scanedDevices:{
    "list": Array<object>
  };

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
        "hadConnected":false,
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
          "last_sended": null,
          "hadGroupSync": false,
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
  speciWrtie(deviceId,data){
    return Observable.create(
      observer => {
        this.checkConnectOnce(deviceId).subscribe(
          ()=>{
            Observable.fromPromise(
              this.ble.writeWithoutResponse(
                deviceId,
                _LIGHTS_SERVICE_UUID,
                _LIGHTS_CHAR_UUID,
                data.buffer
              )).subscribe(
                scc => {
                  observer.next(true);
                  observer.complete();
                },
                err => {
                  console.log('>>> ERR,speciWrtie ');
                 
                  console.log(JSON.stringify(err));
                  observer.next(false);
                  observer.complete();
                }
              );
          },()=>{
            observer.next(false);
            observer.complete();
          }
        );/*
        Observable.fromPromise(
          this.ble.writeWithoutResponse(
            id,
            _LIGHTS_SERVICE_UUID,
            _LIGHTS_CHAR_UUID,
            data.buffer
          )).subscribe(
          scc => {
            observer.next(true);
            observer.complete();
          },
          err => {
            console.log('>>> ERR,speciWrtie ');
            console.log(JSON.stringify(err));
            observer.next(false);
            observer.complete();
          }
          );*/
      }
    );

  }
  syncMultiWrite(deviceId,observer,cmds:Uint8Array[],idx,isOk:boolean[]){
    Observable.fromPromise(
      this.ble.writeWithoutResponse(
        deviceId,
        _LIGHTS_SERVICE_UUID,
        _LIGHTS_CHAR_UUID,
        cmds[idx].buffer
      )).subscribe(
        scc => {
          idx++;
          isOk.push(true);
          if(idx>=cmds.length){  //傳送結束
            observer.next(isOk);
            observer.complete();
          }else{
            setTimeout(()=>{this.syncMultiWrite(deviceId,observer,cmds,idx,isOk);},150);
          }
        },
        err => {
          this._setStatus(JSON.stringify(err));
          idx++;
          isOk.push(false);
          if(idx>=cmds.length){  //傳送結束
            observer.next(isOk);
            observer.complete();
          }else{
            setTimeout(()=>{this.syncMultiWrite(deviceId,observer,cmds,idx,isOk);},150);
          }
        }
      );
  }
  syncSunLightsProcess(devices:lightDeviceType[], idx, observer=null,fan=null,isOkIdxArr){
      this.checkConnectOnce(devices[idx].id, (idx-1>0)?devices[idx-1].id:null ).subscribe(
          isScc => {
            if(isScc){
              this._setStatus(devices[idx].id+' CONNECTED!');
              let cmds=[];
              let time = new Date();
              //cmds.push( new Uint8Array([0xfa,0xa0,time.getHours(),time.getMinutes(),time.getSeconds(),0xff]) );
              //cmds.push( new Uint8Array([0xfa,0xa1,devices[idx].group,0xff]) );
              if(fan)cmds.push( new Uint8Array([0xfa,0xad,fan ,0xff]) );
              
              let loadObj = this._presentLoading(devices[idx].id);
              Observable.create(
                observer => {
                  this.syncMultiWrite(devices[idx].id, observer,cmds, 0, []);
                }
              ).subscribe(
                isOkArr => {
                  isOkIdxArr.push(isOkArr);
                  this._dismissLoading(loadObj);
                  this._setStatus(devices[idx].id +' SENED: '+JSON.stringify(isOkArr));
                  // TODO 連線時會發生多重連接
                  /*if(isOkArr[1]){
                    this.devicesData.modify(devices[idx].id,null,devices[idx].group,true).subscribe();
                  }else{
                    this.devicesData.modify(devices[idx].id,null,devices[idx].group,false).subscribe();
                  }*/
                  setTimeout(
                    ()=>{
                      this.disconnetOnce(devices[idx].id).subscribe(
                        isScc => {
                          this._setStatus(devices[idx].id+' disconnet : '+isScc);
                          setTimeout(
                            ()=>{
                              idx++;
                              if(idx >= devices.length){
                                observer.next(isOkIdxArr);
                                observer.complete();
                              }else{
                                this.syncSunLightsProcess(devices,idx, observer,fan,isOkIdxArr);
                              }
                            },1000
                          );
                        }
                      );
                    },300
                  );
                }
              );
              
            }else{
              this._setStatus(devices[idx].id+' CONNECT FAILED!');
              setTimeout(
                ()=>{
                  isOkIdxArr.push(false);
                  idx++;
                  if(idx >= devices.length){
                    observer.next(true);
                    observer.complete();
                  }else{
                    this.syncSunLightsProcess(devices,idx, observer,fan,isOkIdxArr);
                  }
                },300
              );
            }
          }
        );

 
  }
  syncSunlights(devices:lightDeviceType[],fan=null){
    return Observable.create(
      observer => {
        this.disconnectCurrent().subscribe(
          ()=>{
            this.syncSunLightsProcess(devices, 0, observer, fan, []);
          }
        );
      }
    );

  }
  startScan(services=[_LIGHTS_SERVICE_UUID]){

    this.scanListStore.list = [];
    this._setStatus('掃描中......');
    this.showToast('掃描中......');
    this._change("isSearching",true);
    this.ble.startScan(services).subscribe(
      device => {
        this.devicesData.check(device,true).subscribe(
          findDevice => {
            this.ngZone.run(() => {
              findDevice.hadGroupSync = false;
              this.scanListStore.list.push(findDevice);
              this._scanListOb.next(this.scanListStore.list);
              //this._scanListOb.next(Object.assign({},this.scanListStore).list);
            });
          }
        );
      },
      error => {this._change("isSearching",false);this._showError(error,'掃描藍芽裝置時發生錯誤。');}
    )
  }
  stopScan(){
    if(this.dataStore.isSearching){
      this.ble.stopScan().then(
        ()=>{
          this._change("isSearching",false);
          this._setStatus('掃描停止....');
          this.showToast('掃描停止....');
        },
        () => {
          this._change("isSearching",false);
          this.showToast('停止藍芽掃描時發生錯誤');
        }
      );
    }else{
      this._setStatus('停止掃描....');
    }
  }
  /** SCAN series */
  scan(sec=8,showLoading=true){
    let loadObj = this._presentLoading(false);
    this.scanedDevices["list"] = [];
    this._setStatus('掃描中');
    this._change("isSearching",true);
    this.ble.scan([], sec).subscribe(
      device => {
        this._onDeviceDiscovered(device);
        this._dismissLoading(loadObj);
      },
      error => {
        this._change("isSearching",false);
        this._showError(error,'掃描藍芽裝置時發生錯誤。');this._dismissLoading(loadObj);
      }
    );
    setTimeout(()=>{
      this._change("isSearching",false);
      this._dismissLoading(loadObj);
      this._setStatus('掃描完成......');
    }, 1000*sec);
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
  disconnectCurrent(){
    return Observable.create(
      observer => {
        this.nowStatus.take(1).subscribe(
          obj => {
            if(obj.hadConnected){
              if(!obj.peripheral.id)obj.peripheral.id='';
              Observable.fromPromise(this.ble.isConnected(obj.peripheral.id)).subscribe(
                ()=>{
                  Observable.fromPromise(this.ble.disconnect(obj.peripheral.id))
                  .subscribe( 
                    () => {
                      this._change("device",{
                        "name":null,
                        "o_name" :null,
                        "id": null,
                        "group":null,
                        "last_sended": null,
                        "hadGroupSync": false,});
                      this._change("hadConnected",false);
                      this._onDeviceDisconnected();
                      observer.next(true);observer.complete();
                    },
                    err => {
                      observer.next(false);observer.complete();
                      console.log('中斷連線時發生錯誤！');}
                  );
                  
                },
                ()=>{
                  observer.next(true);observer.complete();
                }
              );
            }else{
              observer.next(true);observer.complete();
            }
          }
        );
      }
    );
    
  }
  /** CONNECT DEVICE series */
  connectDevice(deviceId,todoFn = (p=null)=>{}){
    let loadObj = this._presentLoading(deviceId);
    this.disconnectCurrent().subscribe(
      ()=>{
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
            this._onConnected(peripheral);this._dismissLoading(loadObj);todoFn(peripheral);
          },
          peripheral => {this._onDeviceDisconnected();this._dismissLoading(loadObj);}
        );
      }
    );
    
  }

  disconnetOnce(deviceId){
    return Observable.create(
      observer => {
        if(deviceId){
          Observable.fromPromise(this.ble.disconnect(deviceId))
          .subscribe(
            () => {
              console.log('>>> OK, disconnetOnce(deviceId) OK!!!');
              observer.next(true);observer.complete();
            },
            err => {
              console.log('>>> ERR, disconnetOnce(deviceId) failed!');
              observer.next(false);observer.complete();
          }
          );
        }else{
          console.log('>>> OK, disconnetOnce(deviceId) ALREADY OK!!!');
          observer.next(true);observer.complete();
        }
      }
    )

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
    this._change("isConnected",false);
    let toast = this.toastCtrl.create({
      message: '連線中斷！',
      duration: 1500,
      position: 'bottom'
    });
    toast.present();
  }
  /** */
  checkConnectOnce(deviceId,lastId=null){
    return Observable.create(
      observer=>{

        let loadObj = this._presentLoading(deviceId);
        this.disconnetOnce(lastId).subscribe(
          ()=>{
            setTimeout(
              ()=>{
                observer.next(false);observer.complete();
                this._dismissLoading(loadObj);
              },_BLE_CONNECT_TIMEOUT
            );
            this.ble.connect(deviceId).subscribe(
              peripheral => {
                setTimeout(
                  ()=>{
                    this._dismissLoading(loadObj);
                    observer.next(true);observer.complete();
                  },2500
                );
              },
              peripheral => {
                observer.next(false);observer.complete();
                this._dismissLoading(loadObj);
              }
              
            );
          }
        );

      }
    );
  }
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
                  let loadObj = this._presentLoading(id);
                  this.ble.connect(id).take(1).subscribe(
                    peripheral => {
                      this._dismissLoading(loadObj);
                      console.log('重新連線成功！！');
                      observer.next(true);observer.complete();
                    },
                    peripheral => {
                      alert('無法重新連結到剛才的裝置，請確認裝置是否在附近');
                      this._dismissLoading(loadObj);
                      this._onDeviceDisconnected();
                      observer.error(peripheral);
                    }
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
  write_many_go(observer,cmds:Uint8Array[],idx,isOk:boolean[],loadObj,millsec){
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
            setTimeout(()=>{this.write_many_go(observer,cmds,idx,isOk,loadObj,millsec);},millsec);
            
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
            setTimeout(()=>{this.write_many_go(observer,cmds,idx,isOk,loadObj,millsec);},millsec);
          }
        }
      );
  }
  write_many(value:Uint8Array[],millsec=500){
    console.log('=== CMD VALUE ===');
    console.log(JSON.stringify(value));
    console.log('======');
    return Observable.create(
      observer=>{
        let loadObj = this._presentLoading(this.dataStore.device.id);
        
        this.checkConnect(this.dataStore.device.id).subscribe(
          ()=>{
            this.write_many_go(observer,value,0,[],loadObj,millsec);
          },()=>{this._dismissLoading(loadObj);}
        );
      }
    );
  }
    /**TODO 有機率無法廣播，所以改為多傳送幾次 */
  write_d(value:Uint8Array,sccFn=(id)=>{},errFn=(id)=>{},toBack=false,deviceId=this.dataStore.device.id){
    let cmds = [value, value];
    return Observable.create(
      observer => {
        this.write_many(cmds,800).subscribe(
          isSccArr => {
            if(isSccArr.find(val=>val) ){
              if(toBack) sccFn(this.dataStore.peripheral.id);
              else this.showToast('傳送成功！ ('+ JSON.stringify(isSccArr)+')');
              observer.next(true);
              //this._dismissLoading(loadObj);
            }else{
              if(toBack) errFn(this.dataStore.peripheral.id);
              else this._showError(isSccArr,'傳送失敗');
              observer.next(false);
              //this._dismissLoading(loadObj);
            }
            
          }
        );
      }
    );

  }
  forceWriteOnce(value:Uint8Array,id:string,sec=8){  // ble-operator.ts
    return Observable.create(
      observer => {
        let loadObj = this._presentLoading(id);
        this.scan(sec);
        setTimeout(
          ()=>{
            this.checkConnectOnce(id).subscribe(
              isScc => {
                if(isScc){
                  Observable.fromPromise(
                    this.ble.writeWithoutResponse(
                      id,
                      _LIGHTS_SERVICE_UUID,
                      _LIGHTS_CHAR_UUID,
                      value.buffer
                    )).subscribe(
                      scc => {
                        observer.next(scc);
                        this._dismissLoading(loadObj);
                        this.disconnetOnce(id).subscribe();
                      },
                      err => {
                        observer.next(err);
                        this._dismissLoading(loadObj);
                        this.disconnetOnce(id).subscribe();
                      }
                    );
                }else{
                  observer.next(false);
                }
              }
            );
            this._dismissLoading(loadObj);
          },1000*sec
        );
      }
    );

   
  }
  write(value:Uint8Array,sccFn=(id)=>{},errFn=(id)=>{},toBack=false,deviceId=this.dataStore.device.id){
    let loadObj = this._presentLoading(this.dataStore.peripheral.id);
    /*console.log('=== CMD VALUE ===');
    console.log(JSON.stringify(value));
    console.log('======');*/
    //new Uint8Array(*).buffer
    /**/
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
  private _presentLoading(deviceId) {
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();
    let time = setTimeout(()=>{
      if(deviceId){
        alert(deviceId+'逾時');
        this.disconnetOnce(deviceId).subscribe(
          isScc => {
            this._setStatus('逾時 disconnect : '+isScc);
          }
        );
      }
      loading.dismiss();
    }, _BLE_CONNECT_TIMEOUT);
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
  
  private showToast(message){
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
    this._nowStatus.next(this.dataStore);
  }
  private _showError(error,message) {
    this._setStatus('Error ' + error);
    console.log('>>> scanError() ');
    console.log(JSON.stringify(error));
    let toast = this.toastCtrl.create({
      message: message +' '+JSON.stringify(error),
      position: 'bottom',
      duration: 3000
    });
    toast.present();
  }
}
