import { Component } from '@angular/core';
import { NavParams,AlertController,ModalController,NavController } from 'ionic-angular';
import { BleCommandProvider } from  '../../providers/ble-command/ble-command'

import { BleOperatorPage } from '../ble-operator/ble-operator';
import { NativeStorage } from '@ionic-native/native-storage';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import 'rxjs/add/observable/fromPromise';
import { Observable } from 'rxjs/Observable';

import { lightDeviceType,DevicesDataProvider } from '../../providers/devices-data/devices-data'
import { CollectionsDataProvider,collectionType } from '../../providers/collections-data/collections-data';


const _DEV_SETTINGS_LIST = 'devValueList';
interface devSetting {
  "name":string,
  "value":Array<number>,
  "multiple":number,
  "color":string
}
@Component({
  selector: 'page-dev-mode',
  templateUrl: 'dev-mode.html',
})
export class DevMode {
  /** collectionsList ionCheckbox*/
  collectionsList:Observable<collectionType[]>;
  collectionsChecks:Array<boolean> = Array.from({length:12},v=>false);
  /** */

  devDataStore:{
    "list": Array<devSetting>
  };

  numTest: object = {'0':99};
  ggg: object = {value:1};
  testNumWheel : Function =function(){
    console.log('testNumWheel!');
  }
 /*lightLinesArrType : Array<{
    "value":number
  }>*/
  
  saveSettings : {
    "isEdit":boolean,
  }
  devicesList : Observable<Array<any>>;
  deviceMeta = {
    "groups" : [0],
    "curMultiple":0, 
  };
  constructor(
    private clProv : CollectionsDataProvider,
    private devicesDataProv: DevicesDataProvider,
    private bleCmd: BleCommandProvider,
    private storage:NativeStorage,
    private alertCtrl:AlertController,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    ) {
    this.collectionsList = this.clProv.list;
    this.devicesList = this.devicesDataProv.list;
    //this.lightLinesArr =    
    this.saveSettings= {
      "isEdit":false,
    };
    this.devDataStore = {
      "list":[]
    };
  }
  ionViewDidEnter(){

    Observable.fromPromise(this.storage.getItem(_DEV_SETTINGS_LIST)).subscribe(
      value=>{
        if(typeof value != 'object') value = JSON.parse(value);
        this.devDataStore.list = value;
      },
      ()=>{
        this.devDataStore.list = [
            {"name":"測試1","value":[1,2,3,4,5,6,7,8,9,10,11,12],"multiple":20,"color":"blue"},
            {"name":"測試2","value":[1,2,3,4,5,6,7,8,9,10,11,12],"multiple":20,"color":"blue"},
            {"name":"測試3","value":[1,2,3,4,5,6,7,8,9,10,11,12],"multiple":20,"color":"blue"},
            {"name":"測試3","value":[1,2,3,4,5,6,7,8,9,10,11,12],"multiple":20,"color":"blue"},
          ];
        this.storage.setItem(_DEV_SETTINGS_LIST,this.devDataStore.list).then(); 
      }
    );
  }
  showEdit(){
    this.saveSettings.isEdit = !this.saveSettings.isEdit;
  }
  triggerDevBtn(idx:number){
    console.log('triggerDevBtn('+idx+')');
    if(this.saveSettings.isEdit){
      this.editDevSetting(idx);
    }else{
      this.sendDevSetting(idx);
    }
  }
  addDevSetting(){
    this.devDataStore.list.push({"name":"按鈕","value":[0,0,0,0,0,0,0,0,0,0,0,0],"multiple":30,"color":"blue"});
    this.saveSettingsToStorage();
  }
  saveSettingsToStorage(){
    Observable.fromPromise(this.storage.setItem(_DEV_SETTINGS_LIST,this.devDataStore.list))
      .take(1).subscribe(
        () => {console.log('成功！');},
        () => {alert('未知的錯誤！');}
      );
  }
  editDevSetting(idx:number){
    this.navCtrl.push(editDevSettingPage, { "idx":idx });
  }
  sendDevSetting(idx:number){
    let tmp = this.devDataStore.list[idx];
    this.bleCmd.goDevCollectionsMultiple(
      tmp.multiple,
      this.collectionsChecks,
      tmp.value
    ).subscribe();
  }
  /*sendDevSetting(idx:number){
    let tmp = this.devDataStore.list[idx];
    this.bleCmd.goDevMultiple(
      tmp.multiple,
      this.deviceMeta.groups,
      tmp.value
    ).subscribe();
  }*/
/*
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
  }*/
  openBleModal(){
    this.navCtrl.push(BleOperatorPage);
    /*let modal = this.modalCtrl.create(BleOperatorPage);
    modal.present();*/
  }

onNumberChanged(event){
  console.log(event);
}
  ionViewDidLoad() {
    console.log('ionViewDidLoad DevMode');
  }

}

@Component({
  templateUrl: 'edit-setting.html'
})
export class editDevSettingPage {

  saveSettings : {
    "settingMeta":devSetting;
    "devValueList":Array<devSetting>,
    "lightLinesArr":Array<{
      value:number
    }>
  }
  

  constructor(
    private storage:NativeStorage,
    private alertCtrl: AlertController,
    private navCtrl: NavParams,
    public navigaCtrl: NavController
  ){
    this.saveSettings= {
      "settingMeta":{
        "name":null,
        "value":[],
        "multiple":0,
        "color":"string"
      },
      "devValueList":[],
      "lightLinesArr":Array.from( new Array(12),((val,index) => ({'value':0}) )) // [1 to 12] 
    };

  }
  ionViewDidEnter(){

    Observable.fromPromise(this.storage.getItem(_DEV_SETTINGS_LIST)).subscribe(
      value=>{
        if(typeof value != 'object') value = JSON.parse(value);
        let tmpSetting = value[this.navCtrl.data["idx"]];
        this.saveSettings.settingMeta = {
          "name":tmpSetting.name,
          "value":tmpSetting.value,
          "multiple":tmpSetting.multiple,
          "color":tmpSetting.color
        }
        this.saveSettings.devValueList = value;
        this.saveSettings.lightLinesArr = tmpSetting.value.map(val=>({'value':val}));
      },
      ()=>{}
    );
  }
  remove(){
    let confirm = this.alertCtrl.create({
      title: '刪除此按鈕',
      message: '確定刪除此組按鈕設定？',
      buttons: [
        {
          text: '取消',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: '確定',
          handler: () => {
            this.saveSettings.devValueList.splice(this.navCtrl.data["idx"],1);
            Observable.fromPromise(this.storage.setItem(_DEV_SETTINGS_LIST,this.saveSettings.devValueList))
            .take(1).subscribe(
              () => {
                this.navigaCtrl.pop();
              },
              () => {alert('未知的錯誤！');}
            );
          }
        }
      ]
    });
    confirm.present();
    
  }
  editName(){
    let alert = this.alertCtrl.create({
      title: '更改名稱',
      inputs: [
        {
          name: 'name',
          placeholder: '請輸入按鈕名稱...'
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
            this.saveSettings.settingMeta.name = data.name;
          }
        }
      ]
    });
    alert.present();
  }

  saveSettingsToStorage(){
    console.log(this.saveSettings.lightLinesArr);
    this.saveSettings.settingMeta.value = this.saveSettings.lightLinesArr.map(val=>val.value);
    console.log(this.saveSettings.settingMeta);
    this.saveSettings.devValueList[this.navCtrl.data["idx"]] = this.saveSettings.settingMeta;

    Observable.fromPromise(this.storage.setItem(_DEV_SETTINGS_LIST,this.saveSettings.devValueList))
      .take(1).subscribe(
        () => {alert('成功！');},
        () => {alert('未知的錯誤！');}
      );
  }
}
