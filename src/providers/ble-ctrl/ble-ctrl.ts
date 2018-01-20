import { Injectable,NgZone,Inject, forwardRef } from '@angular/core';
import { Platform,ToastController, LoadingController, AlertController } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';
import { AndroidPermissions } from '@ionic-native/android-permissions';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/observable/fromPromise';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ISubscription } from 'rxjs/Subscription';

import { DevicesDataProvider,lightDeviceType } from '../devices-data/devices-data'
//import { BleCommandProvider } from '../ble-command/ble-command';

const _WRITEMANY_INTERVAL = 200;
const _SHOW_TOAST_DURATION = 1600;

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
  // "peripheral": any,
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
    private alertCtrl: AlertController,
    //@Inject(forwardRef(() => BleCommandProvider)) public bleCmd: BleCommandProvider,
    //private bleCmd: BleCommandProvider,
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

        "device":{
          "name":null,
          "o_name" :null,
          "id": null,
          "group":null,
          "last_sended": null,
          "hadGroupSync": false,
          "collection":null,
          "fanSpeed":null,
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

  public _change(idx:string,value:any, broadcast = true){
    this.dataStore[idx]=value;
    //this._checkUseable();
    if(this.dataStore["isEnabled"]&&this.dataStore["isConnected"]){
      this.dataStore["useable"] = true;
    }else{
      this.dataStore["useable"] = false;
    }
    if(broadcast) {this._nowStatus.next(Object.assign({},this.dataStore));}
  }
  broadcast() {
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
              this.showToast('無法開啟藍芽...');
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
    this.showToast('請使用手機系統的設定自行關閉唷');
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
            setTimeout(()=>{this.write_many_go(deviceId,observer,cmds,idx,isOk);},150);
          }
        }
      );
  }
  syncSunLightsProcess(devices:lightDeviceType[], idx, observer=null,fan=null){
        this.checkConnectOnce(devices[idx].id).subscribe(
          isScc => {
            if(isScc){
              this._setStatus(devices[idx].id+' CONNECTED!');
              let cmds=[];
              let time = new Date();
              cmds.push( new Uint8Array([0xfa,0xa0,time.getHours(),time.getMinutes(),time.getSeconds(),0xff]) );
              cmds.push( new Uint8Array([0xfa,0xa1,devices[idx].group,0xff]) );
              if(fan)cmds.push( new Uint8Array([0xfa,0xad,fan ,0xff]) );
              this._setStatus(devices[idx].id+' SENDING.....');
              let loadObj = this._presentLoading();
              Observable.create(
                observer => {
                  this.syncMultiWrite(devices[idx].id, observer,cmds, 0, []);
                }
              ).subscribe(
                isOkArr => {
                  this._dismissLoading(loadObj);
                  this._setStatus(JSON.stringify(isOkArr));
                  if(isOkArr[1]){
                    this.devicesData.modify(devices[idx].id,null,devices[idx].group,true).subscribe();
                  }else{
                    this.devicesData.modify(devices[idx].id,null,devices[idx].group,false).subscribe();
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

            }else{
              this._setStatus(devices[idx].id+' CONNECT FAILED!');
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
              this.scanListStore.list.push(findDevice.device);
              this._scanListOb.next(this.scanListStore.list);
              //this._scanListOb.next(Object.assign({},this.scanListStore).list);
            });
          }
        );
      },
      error => {this.bleStatus.onScanning =false;this._showError(error,'掃描藍芽裝置時發生錯誤。');}
    );
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
  stopScanBack(){
    this.ble.stopScan().then(
      ()=>{
        this.bleStatus.onScanning =false;
      },
      () => {
      }
    );
  }
  /** SCAN series */
  scanState: {
    sub: ISubscription
  } = {
    sub: {
      closed: true,
      unsubscribe: ()=>{}
    }
  }
  scan(sec=8,showLoading=true){

      let loadObj = {'obj':{}};
      if(showLoading) loadObj.obj = this._presentLoading();
      else this.showToast('掃描中....',sec*1000);
      this.scanedDevices["list"] = [];
      if(!this.scanState.sub.closed) {
        this.stopScanBack();
        this.scanState.sub.unsubscribe();
      }
      return Observable.create(observer => {
        this._setStatus('掃描中');
        this.scanState.sub = this.ble.scan([], sec).subscribe(
          device => {
            this._onDeviceDiscovered(device);
            if(showLoading) this._dismissLoading(loadObj.obj);
          },
          error => {
            this._showError(error,'掃描藍芽裝置時發生錯誤。');
            if(showLoading) this._dismissLoading(loadObj.obj);
          }
        );
        setTimeout(()=>{
          this._setStatus('掃描完成......');
          this._dismissLoading(loadObj.obj);
          observer.next(true);
          observer.complete();
        },1000*sec);

      });





  }

  private _onDeviceDiscovered(device) {
    //console.log('Discovered ' + JSON.stringify(device, null, 2));
    this.devicesData.check(device,false).subscribe(
      findDevice => {
        this.ngZone.run(() => {
          this.scanedDevices["list"].push(findDevice.device);
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
              Observable.fromPromise(this.ble.isConnected(obj.device.id)).subscribe(
                ()=>{
                  Observable.fromPromise(this.ble.disconnect(obj.device.id))
                  .subscribe(
                    () => {
                      this.showToast('中斷連線成功！');
                      this.disConnectDevice(obj.device.id);
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
  connectDeviceObs(deviceId:string) {
    return Observable.create(observer => {
      let loadObj = this._presentLoading();
      this.disconnectCurrent().subscribe(
        ()=>{
          this.ble.connect(deviceId).subscribe(
            peripheral => {
              this._onConnected(peripheral);
              this._change("hadConnected",true);
              let tmpGid = 0;
              setTimeout(()=>{
                observer.next(peripheral);
                this._dismissLoading(loadObj);
                observer.complete();
              },2500);

            },
            peripheral => {
              this._onDeviceDisconnected();
              this._dismissLoading(loadObj);
              observer.error(false);
              observer.complete();
            }
          );
        }
      );
    });
  }
  connectDevice(deviceId,todoFn = (p=null)=>{}){
    let loadObj = this._presentLoading();
    this.disconnectCurrent().subscribe(
      ()=>{
        this.ble.connect(deviceId).subscribe(
          peripheral => {
            this._onConnected(peripheral);
            this._change("hadConnected",true);
            let tmpGid = 0;
            this.devicesData.check(peripheral,true).subscribe(
              (checkData) => {
                // TODO 背景同步 ,  v3 版本之後，增加目檢功能AE，所以不在背景執行
                /*if(checkData.device.group){
                  //this.bleCmd.goSetGroup( isAddNew );

                  let data = new Uint8Array([0xfa,0xa1,checkData.device.group,0xff]);
                  this.write(data,()=>{
                    //this.devicesData.modify(checkData.device.id,null,checkData.isNew).subscribe();
                    this.showToast('已將裝置編號同步！');
                  },()=>{},true);

                }*/
                tmpGid=checkData.device.group;
                this.dataStore.device = checkData.device;

                setTimeout(()=>{

                  if(checkData.isNew) {
                    let data = new Uint8Array([0xfa,0xa1,checkData.device.group,0xff]);
                    this.write(data,()=>{
                      let alert = this.alertCtrl.create({
                        title: '發現新裝置',
                        message: '發現新裝置時，會同步裝置的編號，為了確認裝置正確接收，裝置接受指令後為轉為綠燈，請問現在連線之裝置是否為綠燈呢？',
                        buttons: [
                          {
                            text: '否',
                            role: 'cancel',
                            handler: () => {
                              this.showToast('同步裝置發生錯誤，請重新連線！');
                              this.disconnectCurrent().subscribe();
                              todoFn(peripheral);
                              this._dismissLoading(loadObj);
                            }
                          },
                          {
                            text: '是',
                            handler: () => {
                              console.log('是');
                              this.eyeCheckCmdWrite().subscribe(() => {
                                this.showToast('已將裝置編號同步！');
                                todoFn(peripheral);
                                this._dismissLoading(loadObj);
                              });
                            }
                          }
                        ]
                      });
                      alert.present();
                    },()=>{},true);

                  } else {
                    todoFn(peripheral);
                    this._dismissLoading(loadObj);
                  }
/*
                  let time = new Date();
                  let cmds = [
                    new Uint8Array([0xfa,0xa0,time.getHours(),time.getMinutes(),time.getSeconds(),0xff]),
                    new Uint8Array([0xfa,0xa1,tmpGid,0xff])
                  ];*/
                  // TODO 背景同步 ,  v3 版本之後，增加目檢功能AE，所以不在背景執行
                  /*this.write(data,()=>{
                    this.showToast('已將裝置時間同步！');
                  },()=>{},true);*/
                  /*
                  this.write_many(cmds).subscribe(
                    (isOk)=>{
                      if(!isOk){
                        this.showToast('同步裝置發生錯誤，請斷開並再次連結！')

                      }else{
                        this.showToast('已將裝置時間、編號同步！');
                      }
                    }
                  );*/


                },2500);
              }
            );




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
      err => {console.log(err,'中斷連線時發生錯誤！');}
    );
  }
  private _onConnected(peripheral): void {
    this.ngZone.run(() => {
      this.showToast('連線成功！');
      this._change("isConnected",true,false);
      this._change("device",peripheral,true);
      this._setStatus('連線成功！');
    });
  }

  private _onDeviceDisconnected(): void {
    this._change("device",{
      "name": null,
      "slug": null,  //customize name
      "address": null,
      "peripheral": null
    },false);
    this._change("isConnected",false,false);
    this._change("hadConnected",false,true);
    this.showToast('連線中斷！');

  }
  /** */
  checkConnectOnce(id){

    return Observable.create(
      observer=>{
        let loadObj = this._presentLoading();
        Observable.fromPromise(this.ble.isConnected(id)).subscribe(
          ()=>{
            observer.next(true);observer.complete();
            this._dismissLoading(loadObj);
          },
          ()=>{
            this.ble.connect(id).take(1).subscribe(
              peripheral => {
                setTimeout(
                  ()=>{
                    this._dismissLoading(loadObj);
                    observer.next(true);observer.complete();
                  },1500
                );
              },
              peripheral => {
                observer.next(false);
                this._dismissLoading(loadObj);
              }
            );
          }
        );


      }
    );
  }
  fastConnect(item) {
    return Observable.create(observer => {
      let loadObj = this._presentLoading(true,15);
      this.ble.scan([], 8).subscribe(
        device => {
          if(device.id == item.id){
            this.ble.stopScan().then(()=>{
              this.ble.connect(item.id).take(1).subscribe(
                peripheral => {
                  this._onConnected(item);
                  this._change("hadConnected",true);
                  this._dismissLoading(loadObj);
                  console.log('快速連線成功！！');
                  this.showToast('連線成功！');
                  observer.next(peripheral);observer.complete();
                },
                peripheral => {
                  this._dismissLoading(loadObj);
                  this.disConnectDevice(item.id);
                  this.showToast('無法重新連結到剛才的裝置，請確認裝置是否在附近！');
                  observer.error(peripheral);
                }
              );
            });
          }
        },
        error => {this._showError(error,'找尋藍芽裝置時發生錯誤。');}
      );
    });

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
                  // TODO
                  console.log("checkConnect() => RECONNECT !!!");
                  let loadObj = this._presentLoading(true,15);

                  this.disconnectCurrent().subscribe(
                    isScc =>{
                      setTimeout( ()=>{
                        this.ble.scan([], 10).subscribe(
                          device => {
                            if(device.id == id){
                              this.ble.stopScan().then(()=>{
                                this._dismissLoading(loadObj);
                                this.ble.connect(id).take(1).subscribe(
                                  peripheral => {
                                    console.log('重新連線成功！！');
                                    observer.next(true);observer.complete();
                                  },
                                  peripheral => {
                                    this.disConnectDevice(id);
                                    this.showToast('無法重新連結到剛才的裝置，請確認裝置是否在附近!!');
                                    observer.error(peripheral);
                                  }
                                );
                              });
                            }
                          },
                          error => {this._showError(error,'掃描藍芽裝置時發生錯誤。');}
                        );
                      },500);
                    }
                  );
                }
              );
            }else{
              this.showToast('請先與裝置連線！');
              observer.error(true);observer.complete();
            }

          }
        );


      }
    );

  }
  write_many_go(observer,cmds:Uint8Array[],idx,isOk:boolean[],loadObj, _EYE_CHECK = false){
    let CMD_ARR = [].slice.call(cmds[idx]);
    let CMD_LENGTH = CMD_ARR.length;
    Observable.fromPromise(
      this.ble.writeWithoutResponse(
        this.dataStore.device.id,
        _LIGHTS_SERVICE_UUID,
        _LIGHTS_CHAR_UUID,
        cmds[idx].buffer
      )).subscribe(
        scc => {

          let detail = '';
          switch(CMD_LENGTH) {
            case 9:  // 排程
              if(CMD_ARR[7] == 0xaa) {
                detail += '(清除排程︰Sunlight-）'+CMD_ARR[4];
              }else {
                detail += `(設定排程︰Sunlight-${CMD_ARR[4]}, ${CMD_ARR[5]}:0${CMD_ARR[6]}, 光譜${CMD_ARR[3]+1})`;
              }
              break;
            case 5:  // 風速
              detail += `(設定風速︰Sunlight-${CMD_ARR[3]}, 轉速${CMD_ARR[2]}%）`;
              break;
            case 6: // 時間校正
              if(CMD_ARR[1] == 0xa0) {
                detail += `(時間校正︰所有裝置, 時間${CMD_ARR[2]}:${CMD_ARR[3]}:${CMD_ARR[4]}）`;
              }else if(CMD_ARR[1] == 0xaa) {
                _EYE_CHECK = false;
              }else {}
              break;

          }
          /*
          if(idx>cmds.length-1){  //傳送結束
            this._dismissLoading(loadObj);

            if(isOk.find(val=>val==false)==false){
              this.showToast('傳送指令過程中發生問題，請重新傳送QQ');
              observer.next(false);
            }else{
              observer.next(true);
            }
          }else{} */
          if( _EYE_CHECK ){
            detail += '當下達特定指令時，為了確認裝置正確地接收，裝置接收正確時會改為綠燈。請問目前指定的裝置是否改為綠燈？如否，則請按下「重新發送」，如都無動作，則裝置於20秒後自動關閉綠燈';
            this.eyeCheck(detail).subscribe(check => {
              switch(check) {
                case -1:  // 取消(停止)
                  this.showToast('停止指令發送');
                  this._dismissLoading(loadObj);
                  observer.next(false);
                  break;
                case 0:
                  setTimeout(()=>{this.write_many_go(observer,cmds,idx,isOk,loadObj, true);},_WRITEMANY_INTERVAL);
                  break;
                case 1:
                  idx++;
                  isOk.push(true);
                  if(idx>cmds.length-1){ // 最後一個指令
                    this.showToast('傳送指令完畢！');
                    this._dismissLoading(loadObj);
                    observer.next(true);
                    observer.complete();
                  } else {
                    setTimeout(()=>{this.write_many_go(observer,cmds,idx,isOk,loadObj, true);},_WRITEMANY_INTERVAL);
                  }
                  break;
              }
            });
          } else {
            idx++;
            isOk.push(true);
            if(idx>cmds.length-1){ // 最後一個指令
              this.showToast('傳送指令完畢！');
              this._dismissLoading(loadObj);
              observer.next(true);
              observer.complete();
            } else {
              setTimeout(()=>{this.write_many_go(observer,cmds,idx,isOk,loadObj);},_WRITEMANY_INTERVAL);
            }
          }


        },
        err => {
          console.log(' write ERROR!!!!!!!!!!!!!!!!!!!!!!!!!');
          this.showToast('發生錯誤：'+JSON.stringify(err));
          if(_EYE_CHECK) {
            let detail = '發生錯誤，請重新傳送';
            this.eyeCheckFailed(detail).subscribe(check => {
              switch(check) {
                case -1:  // 取消(停止)
                  this.showToast('停止指令發送');
                  this._dismissLoading(loadObj);
                  observer.next(false);
                  break;
                case 0:
                  setTimeout(()=>{this.write_many_go(observer,cmds,idx,isOk,loadObj, true);},_WRITEMANY_INTERVAL);
                  break;
                case 1:
                  idx++;
                  isOk.push(true);
                  if(idx>cmds.length-1){ // 最後一個指令
                    this.showToast('傳送指令完畢！');
                    this._dismissLoading(loadObj);
                    observer.next(true);
                    observer.complete();
                  } else {
                    setTimeout(()=>{this.write_many_go(observer,cmds,idx,isOk,loadObj, true);},_WRITEMANY_INTERVAL);
                  }
                  break;
              }
            });
          } else { //無目檢
            idx++;
            isOk.push(true);
            if(idx>cmds.length-1){ // 最後一個指令
              this.showToast('傳送指令完畢！');
              this._dismissLoading(loadObj);
              observer.next(true);
              observer.complete();
            } else {
              setTimeout(()=>{this.write_many_go(observer,cmds,idx,isOk,loadObj);},_WRITEMANY_INTERVAL);
            }
          }

          /*
          idx++;
          isOk.push(false);
          if(idx>cmds.length-1){  //傳送結束
            this._dismissLoading(loadObj);
            if(isOk.some(val=>val==false)){
              observer.next(false);
            }else{
              observer.next(true);
            }
            observer.complete();
          }else{
            setTimeout(()=>{this.write_many_go(observer,cmds,idx,isOk,loadObj);},_WRITEMANY_INTERVAL);
          }*/

        }
      );
  }
  write_many(value:Uint8Array[],waitSec=null, _EYE_CHECK=false){
    console.log('=== CMD VALUE ===');
    console.log(JSON.stringify(value));
    console.log('======');
    return Observable.create(
      observer=>{
        let loadObj = this._presentLoading(!waitSec,waitSec);

        this.checkConnect(this.dataStore.device.id).subscribe(
          ()=>{
            this.write_many_go(observer,value,0,[],loadObj, _EYE_CHECK);
          },()=>{
            this._dismissLoading(loadObj);
          }
        );
      }
    );
  }
  writeObs(value:Uint8Array) {
    console.log('=== CMD VALUE ===');
    console.log(JSON.stringify(value));
    console.log('======');
    return Observable.create(observer => {
      let loadObj = this._presentLoading();
      this.checkConnect(this.dataStore.device.id).subscribe(
        (scc)=>{
          Observable.fromPromise(
            this.ble.writeWithoutResponse(
              this.dataStore.device.id,
              _LIGHTS_SERVICE_UUID,
              _LIGHTS_CHAR_UUID,
              value.buffer
            )).subscribe(
              scc => {
                this.showToast('傳送成功！');
                this._dismissLoading(loadObj);
                observer.next(this.dataStore.device.id);
                observer.complete();
              },
              err => {
                this._showError(err,'傳送失敗');
                this._dismissLoading(loadObj);
                observer.error(err);
                observer.complete();
              }
            );
        },(err)=>{
          console.log(err);
          this._showError(err,'傳送失敗');
          this._dismissLoading(loadObj);
          observer.error(err);
          observer.complete();
        }
      );
    });
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
            this.dataStore.device.id,
            _LIGHTS_SERVICE_UUID,
            _LIGHTS_CHAR_UUID,
            value.buffer
          )).subscribe(
            scc => {
              if(toBack) sccFn(this.dataStore.device.id);
              else this.showToast('傳送成功！');
              this._dismissLoading(loadObj);},
            err => {
              if(toBack) errFn(this.dataStore.device.id);
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
  private _presentLoading(isTimeout=true,messageSec=null) {
    let loadingObj = {
      "time":null,
      "loading": this.loadingCtrl.create({
        content: 'Please wait...'
      })
    }
    loadingObj.loading

    if(isTimeout){
      loadingObj.time = setTimeout(()=>{
        this.showToast('逾時');
        loadingObj.loading.dismiss();
      }, 1000*12);
    }else{
      if(messageSec){
        loadingObj.loading = this.loadingCtrl.create({
          content: 'Please wait...</br>(about '+messageSec+' sec)'
        });
        if(messageSec<6) messageSec = 6;
        loadingObj.time = setTimeout(()=>{
          this.showToast('逾時');
          loadingObj.loading.dismiss();
        }, 1000*messageSec);
      }else{
        loadingObj.time = setTimeout(()=>{
          this.showToast('逾時');
          loadingObj.loading.dismiss();
        }, 10000);
      }

    }
    loadingObj.loading.present();
    return loadingObj;
    /*
      setTimeout(() => {
        loading.dismiss();
      }, 5000); */
  }
  private _dismissLoading(loadObj){
    if(loadObj.loading){
      clearTimeout(loadObj.time);
      loadObj.loading.dismiss();
    }else{}
  }

  private showToast(message,time=_SHOW_TOAST_DURATION){
    let toast = this.toastCtrl.create({
      message: message ,
      position: 'bottom',
      duration: time,
      showCloseButton:true
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

  // 目檢功能
  /**
時間校正A0
定義群組 A1
設定排程AB
風扇轉速調整 AD
以上指令下達後，裝置接收正確會改成綠燈
使用者要在手動下達關閉指示燈AE指令
   */
  eyeCheck(detail: string = '') {
    return Observable.create(observer => {
      let alert = this.alertCtrl.create({
        title: '目檢確認',
        message: detail,
        buttons: [
          {
            text: '中止所有動作',
            role: 'cancel',
            handler: () => {
              console.log('取消(停止)');
              observer.next(-1);
              observer.complete();
            }
          },
          {
            text: '重新發送',
            handler: () => {
              console.log('重新發送');
              observer.next(0);
              observer.complete();
            }
          },
          {
            text: '是（下一步）',
            handler: () => {
              console.log('是');
              this.eyeCheckCmdWrite().subscribe(() => {
                observer.next(1);
                observer.complete();
              });
            }
          }
        ]
      });
      alert.present();

    });
  }
  eyeCheckFailed(detail: string = '') {
    return Observable.create(observer => {
      let alert = this.alertCtrl.create({
        title: '目檢確認',
        message: detail,
        buttons: [
          {
            text: '中止所有動作',
            role: 'cancel',
            handler: () => {
              console.log('取消(停止)');
              observer.next(-1);
              observer.complete();
            }
          },
          {
            text: '重新發送',
            handler: () => {
              console.log('重新發送');
              observer.next(0);
              observer.complete();
            }
          }
        ]
      });
      alert.present();

    });
  }
  eyeCheckCmdWrite() {
    return Observable.create(observer => {
      let data = new Uint8Array([0xfa,0xae,0x01,0xff]);
      this.write(data,()=>{
        observer.next(true);
        observer.complete();
      },()=>{
        observer.next(false);
        observer.complete();
      },true);
    });
  }
}
