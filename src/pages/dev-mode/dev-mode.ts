import { Component } from '@angular/core';
import { NavParams,AlertController,ModalController,NavController } from 'ionic-angular';
import { BleCommandProvider } from  '../../providers/ble-command/ble-command'
import { LightsGoupsProvider } from '../../providers/lights-goups/lights-goups'
import { BleOperatorPage } from '../ble-operator/ble-operator';
import { NativeStorage } from '@ionic-native/native-storage';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import 'rxjs/add/observable/fromPromise';
import { Observable } from 'rxjs/Observable';
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
  lightsGroups : Array<any>;
  deviceMeta = {
    "groups" : [0],
    "curMultiple":0, 
  };
  constructor(
    private lightsGroupsProv:LightsGoupsProvider,
    private bleCmd: BleCommandProvider,
    private storage:NativeStorage,
    private alertCtrl:AlertController,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    ) {
    this.lightsGroups = [];
    //this.lightLinesArr =    
    this.saveSettings= {
      "isEdit":false,
    };
    this.devDataStore = {
      "list":[]
    };
  }
  ionViewDidEnter(){
    this.lightsGroupsProv.getGroups().subscribe(
      list => {
        this.lightsGroups = list;
      }
    );
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
    this.bleCmd.goDev(
      tmp.multiple,
      this.deviceMeta.groups,
      tmp.value
    );
  }
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
/*
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
    Observable.fromPromise(this.storage.setItem(_DEV_SETTINGS_LIST,this.saveSettings.devValueList))
      .take(1).subscribe(
        () => {alert('儲存成功！');},
        () => {alert('未知的錯誤！');}
      );
  }
  
*/
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
