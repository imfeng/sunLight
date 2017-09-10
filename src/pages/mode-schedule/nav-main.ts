import { OnInit, Component } from '@angular/core';
import { AlertController ,ViewController, ModalController, NavController, NavParams } from 'ionic-angular';

import { ToastCtrlProvider } from  '../../providers/toast-ctrl/toast-ctrl'
import { LightsInfoProvider, lightsType,lightsTypesPipe } from  '../../providers/lights-info/lights-info'
//import { SectionsDataProvider,sectioDataType } from '../../providers/sections-data/sections-data';
import { PatternsDataProvider,PatternDataType,SectionDataType } from '../../providers/patterns-data/patterns-data';

import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
//Math.floor(new Date().getTime()%(86400000)/60000)*60000;

const _colNumver = 2;
/**
 * Note :
 * NoSql tables:
 *   "lightsGroupsDataArr"
 *   "patternsArr-_GID_" ...
 *   "sectionsArr-GID-PID" ...
 * 
 * TODOS:
 *   lightsGroupsData => 'lightsGroupsDataArr' provider OK
 *   patternData  => 'patternsArr-_GID_' 
 *   sectioData  => None
 * 
 *   "lightsGroupsDataArr":[
 *     { ((lightsGroupsDataType))
 *       "gid": _GID_,
 *       "patternsArr":[
 *         { ((PatternDataType))
 *           "gid":_GID_,
 *           "pid":_PID_,
 *           "sectionsArr":[
 *             {  ((sectioData))
 *               ...
 *             }
 *           ]
 *         }
 *       ]
 *     }
 *   ]
 * 
 * // Structures
 * groups[
 *   { **lightsGroupsData from 'provider/light-groups'**
 *     ...
 *     patterns: [
 *       {  **patternData from 'page/nav.main'**
 *         sections:[ { **sectioData from 'page/nav.main' **...},{...},...]
 *       },{
 *       }
 *     ]
 *   },{
 *     ...
 *   }
 * 
 * ]
 */
// Partent : "lightsGroupsData" from 'providers/lights-groups'

export interface patternData {
  "gid" : number,

  "pid" : number,
  "patternSlug" : string,
  "name" : string,
  "lastSended" : boolean,
  "sections" : Array<any>
}
interface patternsStoreType {
  //"gid": number,
  "list" : Array <patternData>,
  "list_o": Observable<PatternDataType[]>
}
@Component({
    templateUrl: './nav-main/pr1-patterns.html',
    
})
export class pr1patternsNav {
  parentParam : object; 
  patternsStore :any={
    "list" :{},
    "list_o": {}
  };
  /*rows = Array.from(
    Array(Math.ceil(this.patternsStore.list.length/_colNumver)).keys()
    // *ngFor="let row of rows"
    //    *ngFor="let item of this.patternsStore.list | slice: (row*_colNumver):(row+1)*_colNumver"
  );*/
  constructor(
    private toastCtrl:ToastCtrlProvider,
    private pattersProvider :PatternsDataProvider,
    private lightInfos: LightsInfoProvider,
    public navCtrl: NavController,
    public navParams: NavParams) {
      if(!this.navParams.data["gid"]) this.navParams.data["gid"]=0;
      this.patternsStore.list_o = this.pattersProvider.infos;

      let loader = this.toastCtrl.showLoading('讀取中...');
      console.log('=== ENTER "pr1patternsNav" gid: '+this.navParams.data["gid"]+' ===');
      console.log(this.patternsStore);
      this.pattersProvider.loadAll(this.navParams.data["gid"]).take(1).subscribe( scc=>{
        loader.dismiss();
      });
    }

  ionViewDidEnter(){
  }
  /** */
  goNavModes(goGid,goPidx){
    console.log('Go : '+ goGid + ' , ' +goPidx);
    this.pattersProvider.infos.take(1).subscribe(
      arr => {
        let tmpArr = arr.filter((obj,idx) => (obj.gid==goGid)&&(idx==goPidx));
        this.navCtrl.push(pr2ModesNav, {
          "pidx":goPidx,
          "pattern": tmpArr[0]
        });
      }
    );

  }
  addPattern(){
    this.pattersProvider.addNewPattern(this.navParams.data["gid"]).subscribe(
      (scc,err) => {
        if(!scc){
          this.toastCtrl.showToast('未知的錯誤！ '+ err);
        }else{
          console.log('addPattern SCC!');
        }
      }
    );
    
  }

}
/* TEST DATA */
/*
let cursor = 0;
    let cusArr = [
      {
        "gid" : this.parentParam['gid'],
        
        "pid" : cursor++,
          "patternSlug" : 'cus1',
          "name" : '自定排程１',
          "lastSended" : false,
          "sections" : []
      },{
        "gid" : this.parentParam['gid'],
        
        "pid" : cursor++,
          "patternSlug" : 'cus2',
          "name" : '自訂排程２',
          "lastSended" : false,
          "sections" : []
      }
    ]
    let tempArr = this.lightInfos.getTypes().map(obj =>(
      {
        "gid" : this.parentParam['gid'],
        
        "pid" : cursor++,
          "patternSlug" : obj.slug,
          "name" : obj.name,
          "lastSended" : false,
          "sections" : []
      }
    ));
    this.patternsStore.list.push(...cusArr,...tempArr);
*/



@Component({
    templateUrl: './nav-main/pr2-sections.html',
})
export class pr2ModesNav {
    infos: {
      "pidx" : number,
      "pattern" : PatternDataType
    };
    sections: Array<SectionDataType> = [];
    isShowDel : boolean;
    constructor(
      private pattersProvider :PatternsDataProvider,
      private toastCtrl: ToastCtrlProvider,
      private modalCtrl: ModalController,
      private alertCtrl: AlertController,
      public navCtrl: NavController,
      public navParams: NavParams){
        this.isShowDel = false;    
        this.infos = {
          "pidx" : this.navParams.data["pidx"],
          "pattern" : this.navParams.data["pattern"]
        }
        this.sections = this.infos["pattern"].sections;
        console.log('=== *pr2ModesNav* ===');
        console.log(this.navParams);
        console.log(this.infos);
      }
    ionViewDidEnter() {
    }
    saveSections(){
      this.pattersProvider.updatePattern(
        this.infos['pattern'],
        this.infos['pidx']).subscribe(
          (scc,res) => {if(!scc){this.toastCtrl.showToast('儲存失敗');console.log(scc);}else this.toastCtrl.showToast('儲存成功！');}
        );
      //this.infos['lastModified'] = new Date().getTime();
      //console.log(this.infos['lastModified']);
    }
    isShowDelBtn(){
      this.isShowDel = !this.isShowDel;
    }
    delSection(idx){
      this.sections.splice(idx,1);
    }
    addSection() {
      let modal = this.modalCtrl.create(modalSectionEdit,{ "time":"00:00","multiple":0 },{cssClass:'modal-section'});
      modal.onDidDismiss(data => {
        let repeated =this.detectRepeat(data)
        if(data && !repeated){
          this.sections.push(data);
          this.sections.sort( 
            (a,b) => 
            ( (a.time_num[0]==b.time_num[0])?(a.time_num[1]-b.time_num[1]):(a.time_num[0]-b.time_num[0])  ) 
          );
        }else if(repeated){
          this.toastCtrl.showToast('「開始時間」重複，請試試別的時間唷');
        }else{

        }
        //console.log(this.sections);
      });
      modal.present();
    }
    detectRepeat(data){
      if(this.sections.find( (val,idx) => (val.time==data.time)?true:false )){
        return true;
      }
    }
    editName(){
      let alert = this.alertCtrl.create({
        title: '更改名稱',
        inputs: [
          {
            name: 'p_name',
            placeholder: '請輸入排程名稱...'
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
              this.infos["pattern"].p_name =data["p_name"];
            }
          }
        ]
      });
      alert.present();
    }

  }

@Component({
  templateUrl:'./nav-main/modal-section-edit.html',
  providers:[lightsTypesPipe]
})
export class modalSectionEdit{
  //param : object;
  settings:SectionDataType ;
  lightsTypes:Array<string>;
  constructor(
    
    private lightsType: LightsInfoProvider,
    public viewCtrl: ViewController,
    public navParams: NavParams) {
      this.lightsTypes = lightsType.getTypes();
      this.settings= {
        "mode":1,
        "time":this.navParams.data["time"],
        "time_num":[],
        "multiple":this.navParams.data["multiple"]
      }
    }
  add(){
    this.settings["time_num"] = 
      this.settings["time"].split(':').map( (val,idx)=>{ if(idx<2){return parseInt(val,10);} } )
    this.viewCtrl.dismiss(this.settings);
  }
  dismiss() {
    this.viewCtrl.dismiss(false);
  }
}