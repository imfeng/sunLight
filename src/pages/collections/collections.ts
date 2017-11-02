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
  
  collectionsList : Observable<collectionType[]>;

  constructor(
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
              "name":v.o_name,
              "collection": v.collection,
              "group":v.group,
              "id":v.id,
              "isDisabled": false, // 1 Device to N Collections
              /*"isDisabled":(    // 1 Device to 1 Collection
                (v.collection && v.collection!=0)?
                  ((v.collection==this.thisCid)?false:true)
                  :false),*/
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
    //console.log(this.devices_list.data);
    this.devices_list.data
      .map(
        v => {
          let cidFinded = (v.collection.find(v => v==this.thisCid));
          if(( (v.isCheck==false) && cidFinded )){
            this.devicesProv.modify(v.id,null,null,true, v.collection.filter(v=>v!==this.thisCid) ).take(1).subscribe();


          }else if( v.isCheck && !cidFinded ){
            v.collection.push(this.thisCid);
            this.devicesProv.modify(v.id,null,null,true, v.collection ).take(1).subscribe();
            devices.push(v.group);
          }else if(  v.isCheck && cidFinded ){
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