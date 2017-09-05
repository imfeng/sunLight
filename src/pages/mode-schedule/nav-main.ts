import { OnInit, Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { LightsInfoProvider, lightsType } from  '../../providers/lights-info/lights-info'

const _colNumver = 2;
/**
 * Note :
 *  groups 含有 group (依照裝置狀態增加)
 *  group  含有 patterns (使用者增加
 *  patterns 含有 pattern
 *  pattern 含有 sections, 並記錄 "最後傳送時間"
 *  裝置指令來自pattern
 *   group 在 曾改裝置時會自動增加，或手動加入
 * 
 */
// Partent : "lightsGroupsInfos" from 'providers/lights-groups'
export interface patternData {
  "$parentGid" : number,

  "patternId" : number,
  "patternSlug" : string,
  "name" : string,
  "lastSended" : boolean,
  "sections" : Array<any>
}
@Component({
    templateUrl: './nav-main/pr1-patterns.html',
    
})
export class pr1patternsNav implements OnInit {
  parentParam : object; 
  patternsStore = {
    "list" : Array <patternData>(0)
  };
  rows = Array.from(
    Array(Math.ceil(this.patternsStore.list.length/_colNumver)).keys()
    // *ngFor="let row of rows"
    //    *ngFor="let item of this.patternsStore.list | slice: (row*_colNumver):(row+1)*_colNumver"
  );
  constructor(
    private lightInfos: LightsInfoProvider,
    public navCtrl: NavController,
    public navParams: NavParams) {
      this.parentParam = this.navParams.data;
    }
  ngOnInit() {
    this.addPattern();
    console.log(this.patternsStore);
  }
  ionViewDidLoad(){
      console.log(this.navParams.data);
  }
  /** */
  addPattern(){
    let cursor = 0;
    let cusArr = [
      {
        "$parentGid" : this.parentParam['gid'],
        
        "patternId" : cursor++,
          "patternSlug" : 'cus1',
          "name" : '自定排程１',
          "lastSended" : false,
          "sections" : []
      },{
        "$parentGid" : this.parentParam['gid'],
        
        "patternId" : cursor++,
          "patternSlug" : 'cus2',
          "name" : '自訂排程２',
          "lastSended" : false,
          "sections" : []
      }
    ]
    let tempArr = this.lightInfos.getTypes().map(obj =>(
      {
        "$parentGid" : this.parentParam['gid'],
        
        "patternId" : cursor++,
          "patternSlug" : obj.slug,
          "name" : obj.name,
          "lastSended" : false,
          "sections" : []
      }
    ));
    this.patternsStore.list.push(...cusArr,...tempArr);
  }

}

@Component({
    templateUrl: './nav-main/pr2-modes.html',
})
export class pr2ModesNav implements OnInit {
    constructor(
  
      public navCtrl: NavController,
      public navParams: NavParams) {}
    ngOnInit() {}
  }
  