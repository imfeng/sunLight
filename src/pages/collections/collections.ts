import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

import { DevicesDataProvider,lightDeviceType } from '../../providers/devices-data/devices-data';
import { CollectionsDataProvider,collectionType } from '../../providers/collections-data/collections-data';

@IonicPage()
@Component({
  selector: 'page-collections',
  templateUrl: 'collections.html',
})
export class CollectionsPage {
  
  collectionsList : Array<any>;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams
  ) {
    
    this.collectionsList = [
      {
        "cid" : 1,
        "name" : '群組1',
        "devices" : []
      },{
        "cid" : 2,
        "name" : '群組2',
        "devices" : []
      },{
        "cid" : 3,
        "name" : '群組3',
        "devices" : []
      }
    ]
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
  devicesList:Array<any>=[
    {
      "name":"測試裝置1",
      "o_name" :"裝置1",
      "id": "11:22:33",
      "group":1,
      "collection": null,
    },{
      "name":"裝置2",
      "o_name" :"裝置2",
      "id": "11:22:33",
      "group":2,
      "collection": 2,
    },{
      "name":"裝置3",
      "o_name" :"裝置3",
      "id": "11:22:33",
      "group":3,
      "collection": null,
    }
  ];
  devicesCheckList:{
    "data":Array<any>
  };
  constructor(
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
        this.devices_list.data = arr.map(
          (v,idx)=>{
            return {
              "name":v.o_name,
              "collection": (v.collection)?((v.collection!=0)?v.collection:null):null,
              "group":v.group,
              "id":v.id,
              "isDisabled":(
                (v.collection && v.collection!=0)?
                  ((v.collection==this.thisCid)?false:true)
                  :false),
              "isCheck":((v.collection==this.thisCid)?true:false)
            }
          }
        );
        //console.log(this.devices_list.data);
      }
    );
  }
  save(){
    let devices = [];
    //console.log(this.devices_list.data);
    this.devices_list.data
      .map(
        v => {
          if((v.isCheck==false && v.collection == this.thisCid)){
            this.devicesProv.modify(v.id,null,null,false,null).take(1).subscribe();
          }else if(v.isCheck){
            this.devicesProv.modify(v.id,null,null,false,this.thisCid).take(1).subscribe();
            devices.push(v.group);
          }else{
          }
        }
      );
  
    this.clProv.modify(this.thisCid,devices).take(1).subscribe(
      res => {
        if(res){
          alert('儲存成功！');
          this.navCtrl.pop();
        }
      }
    );
  }
}