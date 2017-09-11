import { Component } from '@angular/core';
import { ModalController, NavController,NavParams } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { IonicPage } from 'ionic-angular';  // LazyLoading
import { BleOperatorPage } from '../ble-operator/ble-operator';
import { BleCommandProvider } from  '../../providers/ble-command/ble-command'


import { LightsInfoProvider } from  '../../providers/lights-info/lights-info'
@IonicPage()
@Component({
  selector: 'page-mode-manual',
  templateUrl: 'mode-manual.html',
})
export class ModeManual {
  deviceMeta :  {
    "groups" : Array<number>,
    "curType" : number,
    "curMultiple": number, 
  };
  lightsType : Array<object>;
  lightsGroups : Array<object>=[
    {'id':0,'name':'測試0'},
    {'id':1,'name':'測試1'},
    {'id':2,'name':'測試2'},
    {'id':3,'name':'測試3'},
    {'id':50,'name':'測試50'}
  ];
  constructor(
    private bleCmd: BleCommandProvider,
    public modalCtrl: ModalController,
    private lightsInfo: LightsInfoProvider,
    public navCtrl: NavController,
    public navParams: NavParams,
    public toastCtrl:ToastController) {
      this.deviceMeta = {
        "groups" : [0,1,2,3,50],
        "curType" : 1,
        "curMultiple":0, 
      };
    
  // 
  }
  ngOnInit() {
    this.lightsType = this.lightsInfo.getTypes();
  }
  sendManual(power:boolean){
    let type=this.deviceMeta.curType;
    let multi=this.deviceMeta.curMultiple;
    if(power){
      this.deviceMeta.groups.forEach((group,idx) => {
        setTimeout(()=>{
          this.bleCmd.goManual(
            multi,
            type,
            group,
          );
         }, 1000*idx)
      });
    }else{
      this.deviceMeta.groups.forEach((group,idx) => {
        setTimeout(()=>{
          this.bleCmd.goManual(
            multi,
            0,
            group,
          );
         }, 1000*idx)
      });
    }
    

  }
  openBleModal(){
    let modal = this.modalCtrl.create(BleOperatorPage);
    modal.present();
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad ModeManual');
  }
  test(){
    console.log(this.deviceMeta);
  }
}
