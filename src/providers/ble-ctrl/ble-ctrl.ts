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
  scanListStore : {
    "list":lightDeviceType[]
  }={
    "list":[]
  }
  private _scanListOb = <BehaviorSubject<lightDeviceType[]>>new BehaviorSubject([]);
  bleStatus : {
    "onScanning": boolean,
    "scanList": Observable<lightDeviceType[]>,
  }= {
    "onScanning":false,
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
  syncSunLightsProcess(devices:lightDeviceType[], idx, observer=null,fan=null){
    
        this.connectOnce(devices[idx].id).subscribe(
          isScc => {
            if(isScc){
              this._setStatus(devices[idx].id+' CONNECTED!');
              let writeStatus = {
                "isTime": false,
                "isGroup": false,
                "isFan":false,
              }
              setTimeout(
                ()=>{
                  let time = new Date();
                  let timeData = new Uint8Array([0xfa,0xa0,time.getHours(),time.getMinutes(),time.getSeconds(),0xff]);
                  this.speciWrtie(devices[idx].id,timeData)
                  .subscribe( val=>{
                    writeStatus.isTime=val;
                    this._setStatus(devices[idx].id +' 同步時間!');
                    setTimeout(
                      ()=>{
                        let data = new Uint8Array([0xFA,0xA1,devices[idx].group,0xFF]);
                        this._setStatus('正在將'+devices[idx].id +' 的群組更改為'+devices[idx].group);
                        this.speciWrtie(devices[idx].id,data)
                        .subscribe( val=>{
                          writeStatus.isGroup=val;
                          this.devicesData.modify(devices[idx].id,null,devices[idx].group,val).subscribe();
                          if(val){
                            this._setStatus(devices[idx].id +' 同步群組成功!');
                            this.ngZone.run(() => {
                              devices[idx].hadGroupSync = true;
                            })
                          }else{
                            this._setStatus(devices[idx].id +' 同步群組失敗!');
                            
                          }
                          console.log('>>>>>>> syncSunLightsProcess "'+devices[idx].id+'"');
                          console.log(JSON.stringify(writeStatus));
                          this._setStatus(JSON.stringify(writeStatus));
                          console.log('>>>>>>> >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
                          
                          if(fan){
                            setTimeout(
                              ()=>{
                                let datafan = new Uint8Array([0xfa,0xad,fan ,0xff]);
                                this.speciWrtie(devices[idx].id,datafan).subscribe(
                                  isScc=>{
                                    writeStatus.isFan=val;
                                    if(val){
                                      this._setStatus(devices[idx].id +' 同步風扇成功!');
                                      
                                    }else{
                                      this._setStatus(devices[idx].id +' 同步風扇失敗!');
                                      
                                    }
                                    setTimeout(
                                      ()=>{
                                        this.disconnetOnce(devices[idx].id).subscribe(
                                          isScc => {
                                            this._setStatus(devices[idx].id+' disconnet : '+isScc);
                                            setTimeout(
                                              ()=>{
                                                idx++;
                                                if(idx >= devices.length){
                                                  observer.next(true);
                                                  observer.complete();
                                                }else{
                                                  this.syncSunLightsProcess(devices,idx, observer,fan);
                                                }
                                              },300
                                            );
                                          }
                                        );
                                      },1000
                                    );
                                  }
                                );
                              },100
                            );
                          }else{
                            setTimeout(
                              ()=>{
                                this.disconnetOnce(devices[idx].id).subscribe(
                                  isScc => {
                                    this._setStatus(devices[idx].id+' disconnet : '+isScc);
                                    setTimeout(
                                      ()=>{
                                        idx++;
                                        if(idx >= devices.length){
                                          observer.next(true);
                                          observer.complete();
                                        }else{
                                          this.syncSunLightsProcess(devices,idx, observer,fan);
                                        }
                                      },300
                                    );
                                  }
                                );
                              },1000
                            );
                          }
                        });
                      },100
                    );

                  });
                },1500
              );

              /*setTimeout(
                ()=>{
                  let data = new Uint8Array([0xFA,0xA1,devices[idx].group,0xFF]);    
                  
                  this.speciWrtie(devices[idx].id,data)
                  .subscribe( val=>{
                    
                    console.log('>>>>>>> syncSunLightsProcess "'+devices[idx].id+'"');
                    console.log(JSON.stringify(val));
                    this._setStatus(JSON.stringify(val));
                    console.log('>>>>>>> >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
                    this.ngZone.run(() => {
                      devices[idx].hadGroupSync = true;
                    });
                    alert(devices[idx].id+'成功');
                    
                    this.devicesData.modify(devices[idx].id,null,null,true).subscribe();
                    this.disconnetOnce(devices[idx].id).subscribe(
                      isScc => {
                        console.log('>>>>>>>>>>>>>> disconnetOnce : '+isScc);
                        setTimeout(
                          ()=>{
                            idx++;
                            if(idx >= devices.length){
                              observer.next(true);
                              observer.complete();
                            }else{
                              this.syncSunLightsProcess(devices,idx, observer);
                            }
                          },1000
                        );
                      }
                    );
                  } );
                },1000
              );*/
              
            }else{
              setTimeout(
                ()=>{
                  console.log('>>> connectOnce失敗！');
                  alert(devices[idx].id+' 連接失敗');
                  idx++;
                  if(idx >= devices.length){
                    observer.next(true);
                    observer.complete();
                  }else{
                    this.syncSunLightsProcess(devices,idx, observer, fan);
                  };
                },500
              );
            }
          }
        );
 
  }
  syncSunlights(devices:lightDeviceType[],fan=null){
    return Observable.create(
      observer => {
        this.syncSunLightsProcess(devices, 0, observer, fan);
      }
    );

  }
  startScan(services=[_LIGHTS_SERVICE_UUID]){
    this.bleStatus.onScanning = true;
    this.scanListStore.list = [];
    this._setStatus('掃描中......');
    this.ble.startScan(services).subscribe(
      device => {
        this.devicesData.check(device,true).subscribe(
          findDevice => {
            this.ngZone.run(() => {
              this.scanListStore.list.push(findDevice);
              this._scanListOb.next(this.scanListStore.list);
              //this._scanListOb.next(Object.assign({},this.scanListStore).list);
            });
          }
        );
      },
      error => {this.bleStatus.onScanning =false;this._showError(error,'掃描藍芽裝置時發生錯誤。');}
    )
  }
  stopScan(){
    if(this.bleStatus.onScanning){
      this.ble.stopScan().then(
        ()=>{
          this._setStatus('停止掃描');
          this.bleStatus.onScanning =false;
        },
        () => {
          this.showToast('停止藍芽掃描時發生錯誤');
        }
      );
    }else{
      this._setStatus('停止掃描....');
    }
  }
  /** SCAN series */
  scan(sec=8,showLoading=true){
    let loadObj = this._presentLoading();
    this.scanedDevices["list"] = [];
    this._setStatus('掃描中');
    this.ble.scan([], sec).subscribe(
      device => {
        this._onDeviceDiscovered(device);
        this._dismissLoading(loadObj);
      },
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
  disconnectCurrent(){
    return Observable.create(
      observer => {
        this.nowStatus.take(1).subscribe(
          obj => {
            if(obj.hadConnected){
              Observable.fromPromise(this.ble.isConnected(obj.peripheral.id)).subscribe(
                ()=>{
                  Observable.fromPromise(this.ble.disconnect(obj.peripheral.id))
                  .subscribe( 
                    () => {
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
    let loadObj = this._presentLoading();
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
  disconnetOnce(deviceId){
    return Observable.create(
      observer => {
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
      }
    )

  }
  connectOnce(deviceId,sec=6){  // ble-command.ts
    return Observable.create(
      observer=>{
        let loadObj = this._presentLoading();
        /*this.scan(sec);
        setTimeout(
          ()=>{},1000*sec
        );*/
        this.ble.connect(deviceId).take(1).subscribe(
          peripheral => {
            console.log('>>> OK, connectOnce() _> this.ble.connect(deviceId) OK!!!!!');
            this._dismissLoading(loadObj);
            observer.next(true);
          },
          peripheral => {
            Observable.fromPromise(this.ble.disconnect(deviceId))
            .subscribe(
              () => {
                console.log('>>> WARN, connectOnce() _> this.ble.disconnect(deviceId) !!!!! NO CONNECT!!');
              },
              err => {console.log('>>> ERR, connectOnce() _> this.ble.disconnect(deviceId) failed!');}
            );
            this._dismissLoading(loadObj);
            observer.next(false);
          }
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
    this._change("isConnected",false);
    let toast = this.toastCtrl.create({
      message: '連線中斷！',
      duration: 1500,
      position: 'bottom'
    });
    toast.present();
  }
  /** */
  checkConnectOnce(id){

    return Observable.create(
      observer=>{
        
            
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
              peripheral => {
                observer.error(false);
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
            setTimeout(()=>{this.write_many_go(observer,cmds,idx,isOk,loadObj);},150);
            
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
            setTimeout(()=>{this.write_many_go(observer,cmds,idx,isOk,loadObj);},150);
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
