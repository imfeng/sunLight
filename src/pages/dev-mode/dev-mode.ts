import { Component } from '@angular/core';
import { AlertController,ModalController,NavController } from 'ionic-angular';
import { LightsInfoProvider } from  '../../providers/lights-info/lights-info'
import { BleCommandProvider } from  '../../providers/ble-command/ble-command'

import { BleOperatorPage } from '../ble-operator/ble-operator';
import { NativeStorage } from '@ionic-native/native-storage';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import 'rxjs/add/observable/fromPromise';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'page-dev-mode',
  templateUrl: 'dev-mode.html',
})
export class DevMode {
  numTest: object = {'0':99};
  ggg: object = {value:1};
  testNumWheel : Function =function(){
    console.log('testNumWheel!');
  }
 /*lightLinesArrType : Array<{
    "value":number
  }>*/
  
  saveSettings : {
    "devValueList":Array<{
      "name":string,
      "value":Array<number>
    }>,
    "lightLinesArr":Array<{
      value:number
    }>
  }
  lightsGroups : Array<object>=[
    {'id':0,'name':'測試0'},
    {'id':1,'name':'測試1'},
    {'id':2,'name':'測試2'},
    {'id':3,'name':'測試3'},
    {'id':50,'name':'測試50'}
  ];
  deviceMeta = {
    "groups" : [50],
    "curMultiple":0, 
  };
  constructor(
    private bleCmd: BleCommandProvider,
    private storage:NativeStorage,
    private alertCtrl:AlertController,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    private lightsInfo: LightsInfoProvider) {
    //this.lightLinesArr =    
    this.saveSettings= {
      "devValueList":[],
      "lightLinesArr":Array.from( new Array(12),((val,index) => ({'value':index+1}) )) // [1 to 12] 
    };
    Observable.fromPromise(this.storage.getItem("devValueList")).subscribe(
      value=>{
        if(typeof value != 'object') value = JSON.parse(value);
        this.saveSettings.devValueList = value;
      },
      ()=>{
        this.storage.setItem("devValueList",[]).then(); 
      }
    );


  }
  sendDev(){
    let multi=this.deviceMeta.curMultiple;
    this.deviceMeta.groups.forEach((group,idx) => {
      setTimeout(()=>{
        this.bleCmd.goDev(
          multi,
          group,
          this.saveSettings.lightLinesArr.map(val=>val.value)
        );
       }, 1000*idx,group)
    });
  }
  openBleModal(){
    let modal = this.modalCtrl.create(BleOperatorPage);
    modal.present();
  }
  openFanModal(){
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
            this.bleCmd.goFan(data.speed);
            console.log('傳送');
          }
        }
      ]
    });
    confirm.present();
  }
  devModeSetting(){
    //console.log(this.saveSettings.devValueList[0]);
    let tmplist = this.saveSettings.devValueList.map( (val,idx) =>({
      "name":idx.toString(),
      "type":'radio',
      'label':val.name + '('+ val.value.toString()+')',
      'value':val.value.toString()
    }));
    tmplist.push({
      name: '0',
      type: 'radio',
      label: '測試 (10,20,50,100,90,10,50,10,10,60,10,20',
      value: '10,20,50,100,90,10,50,10,10,60,10,20',
    });
    let alert = this.alertCtrl.create({
      cssClass: 'devModeSetting',
      title: '亮度管理',
      message: '選擇需要的亮度階數 或 增加當前設定',
      inputs: tmplist,
      buttons: [
        {
          text: '使用',
          handler: (data) => {
            console.log('選擇 clicked');
            console.log(data);
            
            this.saveSettings.lightLinesArr =data.split(',').map(val=>({"value":parseInt(val)}));
            //data.value.
          }
        },
        {
          text: '增加當前的設定值',
          handler: () => {
            this.addSettings();
            console.log('增加 clicked');
          }
        },
        {
          text: 'Cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },

      ]
    });

    alert.present();
  }
  addSettings(){
    let confirm = this.alertCtrl.create({
      title: '增加亮度階數設定',
      inputs: [
        {
          name: 'name',
          placeholder: '名稱'
        },
        {
          name: 'value',
          type: 'text',
          placeholder: '數值',
          value: this.saveSettings.lightLinesArr.map(val=>val.value).toString()
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
          text: '增加',
          handler: data => {
            data["value"] = data["value"].split(',').map(val=>parseInt(val));
            this.saveSettings.devValueList.push({
              "name":data["name"],
              "value":data["value"],
            });
            this.saveSettingsToStorage();
            console.log(data);
            console.log('增加 clicked');
          }
        }
      ]
    });
    confirm.present();
  }
  saveSettingsToStorage(){
    Observable.fromPromise(this.storage.setItem("devValueList",this.saveSettings.devValueList))
      .take(1).subscribe(
        () => {alert('儲存成功！');},
        () => {alert('未知的錯誤！');}
      );
  }
  onNumberChanged(event){
    console.log(event);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DevMode');
  }

}
