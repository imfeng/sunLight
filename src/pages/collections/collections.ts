import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

import { DevicesDataProvider,lightDeviceType } from '../../providers/devices-data/devices-data';
import { CollectionsDataProvider,collectionType } from '../../providers/collections-data/collections-data';
import { BleCommandProvider } from './../../providers/ble-command/ble-command';
import { EyeCheckControl } from '../eye-check/eye-check.control';
import { ToastCtrlProvider } from '../../providers/toast-ctrl/toast-ctrl';

@IonicPage()
@Component({
  selector: 'page-collections',
  templateUrl: 'collections.html'
})
export class CollectionsPage {

  collectionsList : Observable<collectionType[]>;

  constructor(
    private toastCtrl:ToastCtrlProvider,
    private clProv : CollectionsDataProvider,
    public navCtrl: NavController,
    public navParams: NavParams
  ) {

    this.collectionsList = this.clProv.list;

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CollectionPage');
  }
  edit(cid:number){
    this.navCtrl.push(cListPage,{"cid":cid});
  }

}
@Component({
  templateUrl: 'edit.html',
})
export class cListPage{
  devices_list:{
    "data":Array<any>;
  };
  thisCid:number;

  devicesCheckList:{
    "data":Array<any>
  };
  constructor(
    private toastCtrl:ToastCtrlProvider,
    public eyeCheckCtrl: EyeCheckControl,
    private bleCmd: BleCommandProvider,
    private clProv : CollectionsDataProvider,
    private devicesProv:DevicesDataProvider,
    public navCtrl: NavController,
    public navParams: NavParams
  ) {

    this.devices_list={
      "data":[]
    }
    this.thisCid = navParams.get("cid");
    this.devicesCheckList = {
      "data":[]
    }
    this.load();

  }
  load(){
    this.devicesProv.list.take(1).subscribe(
      arr => {
        console.log(arr);
        this.devices_list.data = arr.map(
          (v,idx)=>{
            return {
              "name":v.name,
              "collection": v.collection,
              "group":v.group,
              "id":v.id,
              //"isDisabled": false, // 1 Device to N Collections
              "isDisabled":(    // 1 Device to 1 Collection
                (v.collection.length>0)?
                  ((v.collection.find(v=>v==this.thisCid))?false:true)
                  : false ),
              "isCheck": ((v.collection.find(v => v==this.thisCid))?true:false)
              //((v.collection==this.thisCid)?true:false)
            }
          }
        );
        //console.log(this.devices_list.data);
      }
    );
  }
  save(){
    let devices = [];
    let rmDevices = [];
    let addDevices = [];
    //console.log(this.devices_list.data);
    this.devices_list.data
      .map(
        v => {
          let cidFinded = (v.collection.find(v => v==this.thisCid));
          if(( (v.isCheck==false) && cidFinded )){
            this.devicesProv.modify(v.id,null,null,true, v.collection.filter(v=>v!==this.thisCid) ).take(1).subscribe();

            rmDevices.push(v.group);
          }else if( v.isCheck && !cidFinded ){
            v.collection.push(this.thisCid);
            this.devicesProv
              .modify(v.id,null,null,true, v.collection )
              .take(1).subscribe();

            devices.push(v.group);
            addDevices.push(v.group);
          }else if(  v.isCheck && cidFinded ){
            devices.push(v.group);
          }else{
          }
        }
      );
      console.log('devices:');
      console.log(devices);
      console.log('rmDevices:');
      console.log(rmDevices);
      console.log('addDevices:');
      console.log(addDevices);
      console.log('CID');
      console.log(this.thisCid);
      if(rmDevices.length>0 || addDevices.length>0) {

        this.bleCmd.deviceAddCollection(rmDevices, addDevices, this.thisCid-1)
        .subscribe(obj => {
          console.log(obj);
          obj.addDevicesCmds.rmSchedule = [
            ...obj.rmDevicesCmds, ...obj.addDevicesCmds.rmSchedule,
          ]
          this.eyeCheckCtrl.pSchedule(obj.addDevicesCmds);
        });
      }

/*
      this.bleCmd.goSyncSchedule(null, this.thisCid,devices).take(1).subscribe(list=>{
        this.eyeCheckCtrl.pSchedule(list);
      },()=>{});*/

      this.clProv.modify(this.thisCid,devices).take(1).subscribe(
        res => {
          if(res){
            // alert('儲存成功！');
            this.toastCtrl.showToast('儲存成功！');
            this.navCtrl.pop();
          }
        }
      );



  }
}
