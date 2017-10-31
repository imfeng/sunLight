import { Component } from '@angular/core';
import { ModalController, NavController,NavParams } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { IonicPage } from 'ionic-angular';  // LazyLoading
import { BleOperatorPage } from '../ble-operator/ble-operator';
import { BleCommandProvider } from  '../../providers/ble-command/ble-command'
import { LightsGoupsProvider } from '../../providers/lights-goups/lights-goups'
import { Observable } from 'rxjs/Observable';

import { LightsInfoProvider,lightsTypesPipe } from  '../../providers/lights-info/lights-info'
import { CollectionsDataProvider,collectionType } from '../../providers/collections-data/collections-data';


@IonicPage()
@Component({
  selector: 'page-mode-manual',
  templateUrl: 'mode-manual.html',
  providers:[lightsTypesPipe]
})
export class ModeManual {
  curType:number = -1;
  collectionsList:Observable<collectionType[]>;
  collectionsChecks:Array<boolean> = [false,false,false,false,false,false];
  deviceMeta :  {
    "groups" : Array<number>,
    "curType" : number,
    "curMultiple": number, 
    "groupsList": Array<object>,

    "multipleList": Array<number>
  };
  lightsType : Array<object>;
  lightsGroupsList : Array<object>;
  constructor(

    private clProv : CollectionsDataProvider,
    //private blePage: BleOperatorPage,
    private lightsGroups:LightsGoupsProvider,
    private bleCmd: BleCommandProvider,
    public modalCtrl: ModalController,
    private lightsInfo: LightsInfoProvider,
    public navCtrl: NavController,
    public navParams: NavParams,
    public toastCtrl:ToastController) {
      this.collectionsList = this.clProv.list;
      
      this.deviceMeta = {
        "groups" : [0],
        "curType" : 1,
        "curMultiple":0, 
        "groupsList": [],

        "multipleList": [0,0,0,0,0,0]
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
  disableManual(){


  }
  trigger(event,type:number){
/*
    for(let i=0;idx<this.deviceMeta.multipleList.length;i++){
      if(i != idx){
          this.deviceMeta.multipleList[i]=0;
      }
    }*/
    //this.sendManual(true);
    this.curType = (type);
    this.sendManual(true,type,this.deviceMeta.multipleList[type]);
    /*for(let i=0;i<6;i++){
      if(i != idx){
       this.deviceMeta.multipleList[i]=0;
      }else{
        this.sendManual(true,idx,this.deviceMeta.multipleList[i]);
      }
    }*/
 
  }
  sendManual(power:boolean,type=0,multi=0){
    console.log(this.collectionsChecks);
    //let type=this.deviceMeta.curType;
    //let multi=this.deviceMeta.curMultiple;
    let sendList = [];
    this.collectionsList.take(1).subscribe(
      arr => {
        this.collectionsChecks.map(
          (isCheck,idx) => {
            if(isCheck){
              arr[idx].devices.map(
                v => sendList.push(v)
              )
            }
          }
        );
      }
    );
    console.log('SendList:');
    console.log(sendList);

    
    if(power){
      sendList.forEach((group,idx) => {
        setTimeout(()=>{
          this.bleCmd.goManualMode(
            multi,
            type,
            group,
          );
         }, 400*idx)
      });
    }else{
      sendList.forEach((group,idx) => {
        setTimeout(()=>{
          this.bleCmd.goManualMode(
            multi,
            0,
            group,
          );
         }, 400*idx)
      });
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
