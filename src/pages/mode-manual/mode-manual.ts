import { Component } from '@angular/core';
import { ModalController, NavController,NavParams } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { IonicPage } from 'ionic-angular';  // LazyLoading
import { BleOperatorPage } from '../ble-operator/ble-operator';
import { BleCommandProvider } from  '../../providers/ble-command/ble-command'
import { LightsGoupsProvider } from '../../providers/lights-goups/lights-goups'


import { LightsInfoProvider } from  '../../providers/lights-info/lights-info'
@IonicPage()
@Component({
  selector: 'page-mode-manual',
  templateUrl: 'mode-manual.html',
})
export class ModeManual {
  demoDevice = [
    {
      "name":'裝置1',
      "gid":1,
      "checked":false,
    },{
      "name":'裝置2',
      "gid":2,
      "checked":false,
    },{
      "name":'裝置3',
      "gid":3,
      "checked":false,
    },{
      "name":'裝置4',
      "gid":4,
      "checked":false,
    },{
      "name":'裝置5',
      "gid":5,
      "checked":false,
    },
  ]
  deviceMeta :  {
    "groups" : Array<number>,
    "curType" : number,
    "curMultiple": number, 
    "groupsList": Array<object>
  };
  lightsType : Array<object>;
  lightsGroupsList : Array<object>;
  constructor(
    //private blePage: BleOperatorPage,
    private lightsGroups:LightsGoupsProvider,
    private bleCmd: BleCommandProvider,
    public modalCtrl: ModalController,
    private lightsInfo: LightsInfoProvider,
    public navCtrl: NavController,
    public navParams: NavParams,
    public toastCtrl:ToastController) {

      this.deviceMeta = {
        "groups" : [0],
        "curType" : 1,
        "curMultiple":0, 
        "groupsList": []
      };
      //this.deviceMeta.groupsList.push({'id':0,'name':'廣播'});
      //this.deviceMeta.groupsList.push({'id':1,'name':'測試1'});
      
    
  // 
  }
  ionViewDidEnter(){
    this.lightsGroups.getGroups().subscribe(
      list => {
        this.deviceMeta.groupsList = list;
      }
    );
  }
  ngOnInit() {
    this.lightsType = this.lightsInfo.getTypes();
  }
  sendManualBrod(){
    let type=this.deviceMeta.curType;
    let multi=this.deviceMeta.curMultiple;
    this.bleCmd.goManual(
      multi,
      type,
      0,
    );
  }
  sendManual(power:boolean){
    let type=this.deviceMeta.curType;
    let multi=this.deviceMeta.curMultiple;

    let sendDemoList = this.demoDevice.filter( val=>val.checked).map(val=>val.gid);
    console.log(JSON.stringify(sendDemoList));
    if(power && sendDemoList.length>0){
      this.bleCmd.goManualMulti(multi,type,sendDemoList);
      /*this.deviceMeta.groups.forEach((group,idx) => {
        setTimeout(()=>{
          this.bleCmd.goManual(
            multi,
            type,
            group,
          );
         }, 1000*idx)
      });*/
    }else if(sendDemoList.length>0){
      this.bleCmd.goManualMulti(multi,0,sendDemoList);
      /*this.deviceMeta.groups.forEach((group,idx) => {
        setTimeout(()=>{
          this.bleCmd.goManual(
            multi,
            0,
            group,
          );
         }, 1000*idx)
      });*/
    }else{
      
    }
  }
  openBleModal(){
    this.navCtrl.push(BleOperatorPage);
    /*let modal = this.modalCtrl.create(BleOperatorPage);
    modal.present();*/
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad ModeManual');
  }
  test(){
    console.log(this.deviceMeta);
  }
}
