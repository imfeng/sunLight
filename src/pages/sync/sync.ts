import { Component } from '@angular/core';
import { ModalController, AlertController, IonicPage, NavController, NavParams } from 'ionic-angular';

import { DevicesDataProvider,lightDeviceType } from '../../providers/devices-data/devices-data';
import { nowStatus,BleCtrlProvider } from '../../providers/ble-ctrl/ble-ctrl';
import { BleCommandProvider } from '../../providers/ble-command/ble-command';

@Component({
  selector: 'page-sync',
  templateUrl: 'sync.html',
})
export class SyncPage {
  scanToggle = {
    "btn" : false
  }
  blueInfo : {
    "nowStatus":nowStatus,
    "fanSpeed":number
  }={
    "nowStatus":null,
    "fanSpeed":null
  }
  devices : {
    "list":lightDeviceType[]
  }= {
    "list":[
      {"name":'測試1',
      "o_name" :'測試1o',
      "id": '00:11:22:33:4:55:66',
      "group":null,
      "last_sended": null,
      "hadGroupSync":false,
      "collection":null,
    },
      {"name":'測試2',
      "o_name" :'測試2o',
      "id": '22:11:22:33:4:55:66',
      "group":2,
      "last_sended": null,
      "hadGroupSync":false,
      "collection":null,}
    ]
  }
  constructor(
    public bleCtrl: BleCtrlProvider,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    public navCtrl: NavController, public navParams: NavParams) {
      this.blueInfo.nowStatus = this.bleCtrl.dataStore;
      this.bleCtrl.nowStatus.subscribe(
        nowStatus => {
          this.blueInfo.nowStatus = nowStatus;
        }
      );
      this.devices = this.bleCtrl.scanListStore;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SyncPage');
  }
  editSpeed(){
    let confirm = this.alertCtrl.create({
      title: '風速調整 0~100',
      inputs: [
        {
          name: 'speed',
          type: 'number',
          placeholder: '數值'
        },
      ],
      buttons: [
        {
          text: '取消',
          handler: () => {
            console.log('取消 clicked');
          }
        },
        {
          text: '傳送',
          handler: data => {
            this.blueInfo.fanSpeed = data.speed;
          }
        }
      ]
    });
    confirm.present();
  }
  scanOnchange(){
    console.log(this.scanToggle.btn);
    if(this.scanToggle.btn){
      this.bleCtrl.startScan();
    }else{
      this.bleCtrl.stopScan();
    }
  }
  syncDevices(){
    this.bleCtrl.syncSunlights(this.devices.list,this.blueInfo.fanSpeed).subscribe(
      isScc=>{
        alert('結束！'+isScc);
      }
    );
  }
  editDevice(idx){
    //this.navCtrl.push(editDeviceSyncPage, { "id":deviceId });
    console.log(this.devices.list[idx]);
    let alert = this.alertCtrl.create({
      title: '調整',
      message: '',
      inputs: [
        {
          name: 'name',
          type: 'string',
          placeholder: '請輸入更改名稱(僅此手機看的到)',
          value: this.devices.list[idx].name
        },
        {
          name: 'gid',
          type: 'number',
          placeholder: '請輸入群組0~255'
        }
      ],
      buttons: [
        {
          text: '取消',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: '修改',
          handler: data => {
            this.devices.list[idx].name = data.name;
            this.devices.list[idx].group = parseInt(data.gid);
            console.log('修改');
          }
        }
      ]
    });
    alert.present();
  }

}
@Component({
  templateUrl: 'edit-device.html'
})
export class editDeviceSyncPage {
  
    deviceInfo :{"data":lightDeviceType}={
      "data":{
        "name":'讀取中...',
        "o_name" :'',
        "id": '',
        "group":0,
        "last_sended": 0,
        "hadGroupSync": false,
        "collection":null,
      }
    };
    constructor(
      private bleCmd: BleCommandProvider,
      private devicesProv:DevicesDataProvider,  
      private alertCtrl: AlertController,
      private navCtrl: NavParams,
    ){
      console.log(navCtrl);
      devicesProv.get(navCtrl.data["id"]).subscribe(
        (obj) => {
          this.deviceInfo.data = obj;
        },
        () => {
          alert('錯誤');
        }
      );
      
    }
    /*
    editName(){
      let alert = this.alertCtrl.create({
        title: '更改名稱',
        inputs: [
          {
            name: 'd_name',
            placeholder: '請輸入裝置名稱...'
          }
        ],
        buttons: [
          {
            text: '取消',
            role: 'cancel',
            handler: data => {
              console.log('Cancel clicked');
            }
          },
          {
            text: '確定',
            handler: data => {
              this.deviceInfo.data.name = data.d_name;
              this.change(data.d_name,null);
            }
          }
        ]
      });
      alert.present();
    }
    editGroup(deviceId){
      let alert = this.alertCtrl.create({
        title: '調整群組',
        message: '',
        inputs: [
          {
            name: 'gid',
            type: 'number',
            placeholder: '請輸入群組0~255'
          }
        ],
        buttons: [
          {
            text: '取消',
            role: 'cancel',
            handler: data => {
              console.log('Cancel clicked');
            }
          },
          {
            text: '修改',
            handler: data => {
              let gid = parseInt(data.gid);
              this.change(null,gid);
              console.log('傳送');
            }
          }
        ]
      });
      alert.present();
    }
    change(name,gid){
      console.log('change');
      this.devicesProv.modify(this.deviceInfo.data.id, name, gid).subscribe(
        ()=>alert('成功！'),
        (err,message)=>alert('錯誤 : '+message)
      );
    }
    add(){
      this.settings["time_num"] = 
        this.settings["time"].split(':').map( (val,idx)=>{ if(idx<2){return parseInt(val,10);} } )
      this.viewCtrl.dismiss(this.settings);
    }
    dismiss() {
      this.viewCtrl.dismiss(false);
    }*/
  }
  