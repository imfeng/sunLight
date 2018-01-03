import { Injectable } from '@angular/core';
import { NativeStorage } from '@ionic-native/native-storage';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/observable/fromPromise';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { LightsInfoProvider } from '../../providers/lights-info/lights-info'
//import { colllectsIdxToString } from '../../providers/collections-data/collections-data'
const _STORAGE_SCHEDULE_NAME = 'scheduleList'
const _STORAGE_SYNC_SCHEDULE_NAME = 'scheduleSyncList'
export interface sectionDataType {
  "mode":number,
  "time":string,
  "time_num":Array<number>,  // [ HOUR , MIN ]
  "multiple":number,
}
export interface scheduleType {
  "name":string,
  "chartDatas":{
    "colors": Array<any>,
    "datasets": Array<any>
  },
  "lastModified":number,
  "sectionsList":Array<sectionDataType>,
  "checks":Array<boolean>,

  "dateRange":Array<number> // [ start ,end ]
}
@Injectable()
export class ScheduleDataProvider {
  lightsColor : any = this.lightsInfo.getTypes('color');
  list:Observable<scheduleType[]>;
  private _list:BehaviorSubject<scheduleType[]>;
  dataStore:{
    "scheduleList": Array<scheduleType>
  }

  constructor(
    private lightsInfo:LightsInfoProvider,
    private storage:NativeStorage

  ) {
    this._list = <BehaviorSubject<scheduleType[]>>new BehaviorSubject([]);
    this.list = this._list.asObservable();
    this.dataStore = {
      "scheduleList": []
    }
    console.log('>>>> ScheduleDataProvider');
    this.loadAll();
  }
  loadAll(){
    Observable.fromPromise(this.storage.getItem(_STORAGE_SCHEDULE_NAME)).subscribe(
      (arr)=>{
        if(typeof arr != 'object') JSON.parse(arr);
        this.dataStore.scheduleList = arr;
        this._list.next(Object.assign({}, this.dataStore).scheduleList);
      },
      (err)=>{
        if(err.code==2 ||err.code.code==2 ){
          let temp = [];
          Observable.fromPromise(this.storage.setItem(_STORAGE_SCHEDULE_NAME,temp))
            .subscribe(
              res => { this._list.next(Object.assign({}, this.dataStore).scheduleList); },
              err => { alert('錯誤!'); }
            );
        }else{
          alert("錯誤" + JSON.stringify(err));
        }
      }
    );
  }
  detectRepeatSchedule(scheIdx:number,collects:Array<boolean>){
    console.log('detectRepeatSchedule');
    console.log(this.dataStore.scheduleList[scheIdx].checks);
    console.log(collects);
    let isRepeat 
      = this.dataStore.scheduleList[scheIdx].checks
        .map( (v,idx) => (v===true && collects[idx]===true))
        .find(v=>v);
    console.log(isRepeat);
    return (false||isRepeat)?true:false;
  }
  detectDateRange(range:Array<number>,scheIdx:number,checks:Array<boolean>){
    let isInRange = false;
    return Observable.create(
      observer => {
        this.list.take(1).subscribe(
          arr => {
            let isRepeat = arr.find(
              (ss,idx)=>{
                if(idx==scheIdx) return false;
                if(range[0]<ss.dateRange[0]){
                  if(range[1]>=ss.dateRange[0]){
                    return this.detectRepeatSchedule(idx,checks);
                  }else{
                    return false;
                  }
                }else if(range[0] == ss.dateRange[0]){
                  return this.detectRepeatSchedule(idx,checks);
                }else{  // range[0] > ss.dateRange[0]
                  if(range[0]<=ss.dateRange[1]){
                    return this.detectRepeatSchedule(idx,checks);
                  }else{
                    return false;
                  }
                }
              }
            );
            if(!isRepeat)isRepeat=null;
            observer.next(isRepeat);
            observer.complete();
          }
        );
      }
    );
  }
  getSyncSchedule(){
    return Observable.create(
      observer => {
        Observable.fromPromise(this.storage.getItem(_STORAGE_SYNC_SCHEDULE_NAME)).subscribe(
          (arr)=>{
            if(typeof arr != 'object') JSON.parse(arr);
            observer.next(arr);
            observer.complete();
          },
          (err)=>{
            if(err.code==2){
              let temp = [];
              Observable.fromPromise(this.storage.setItem(_STORAGE_SYNC_SCHEDULE_NAME,temp))
                .subscribe(
                  res => { 
                    observer.next(temp);
                    observer.complete(); },
                  err => { alert('錯誤!'); }
                );
            }else{
              alert("錯誤" + JSON.stringify(err));
            }
          }
        );
      }
    );
  }
  saveSyncSchedule(syncData:Array<any>){
    Observable.fromPromise(this.storage.setItem(_STORAGE_SYNC_SCHEDULE_NAME,syncData))
      .subscribe(
        res => { console.log('saveSyncSchedule()'); },
        err => { alert('錯誤!'); }
      );
  }
  sectionsToCharts(sections:Array<sectionDataType>,dateRange,isOnlyRange=false){
    let chart = {
      "data":[],
      "backgroundColor": [],
      "labels":[]
    }
    if(isOnlyRange){
      if(sections.length>0){
        for(let i =dateRange[0];i<=dateRange[1];i++){
          let tmp = sections[i-dateRange[0]];
          //chart.data.push((tmp.multiple==0)?-1:tmp.multiple);
          chart.data.push(tmp.multiple);
          chart.backgroundColor.push(this.lightsColor[ tmp.mode-1 ]);
          chart.labels.push( this.dateHourNumberToString(tmp.time_num[0]) );
        }
      }
      
    }else{
      for(let i =0;i<24;i++){
        if(i>=dateRange[0] && i<=dateRange[1]){
          let tmp = sections[i-dateRange[0]];
          chart.data.push((tmp.multiple==0)?0:tmp.multiple);
          chart.backgroundColor.push(this.lightsColor[ tmp.mode-1 ]);
        }else{
          chart.data.push(-2);
          chart.backgroundColor.push('rgb(200,200,200)');
        }
      }
    }

    return chart;
  }
  modifySchedule(idx:number,sections:Array<sectionDataType>,checks:Array<boolean>,dateRange:Array<number>){
    return Observable.create(
      observer => {
        this.list.take(1).subscribe(
          arr => {
            arr[idx].dateRange = dateRange;
            arr[idx].sectionsList = sections;
            arr[idx].checks = checks;
            let chart =  this.sectionsToCharts(sections,dateRange);
            arr[idx].chartDatas = {
              "datasets": [
                {"data":chart.data,"type":'line',borderColor: 'rgba(72,138,255,0.8)',},
                {"data":chart.data},
              ],
              "colors":this.gChartColorsSet(chart.backgroundColor),
            }
            arr[idx].lastModified = new Date().getTime();
           
            
            Observable.fromPromise(this.storage.setItem(_STORAGE_SCHEDULE_NAME,arr))
              .subscribe(
                res => { this._list.next(Object.assign({}, this.dataStore).scheduleList); },
                err => { alert('錯誤!'); }
              );
            
            observer.next(true);
            observer.complete();

          }
        );
      }
    );
  }


  getSchedule(idx:number){
    return Observable.create(
      observer => {
        this.list.take(1).subscribe(
          arr => {
            console.log(arr[idx]);
            observer.next(arr[idx]);
            observer.complete();
          }
        );
      }
    );

  }
  /** */
  remove(idx:number){
    this.list.take(1).subscribe(
      arr => {
        arr.splice(idx,1);
        let tempSetOb = Observable.fromPromise(this.storage.setItem(_STORAGE_SCHEDULE_NAME,arr));
        tempSetOb.subscribe(
          scc => { this._list.next(Object.assign({}, this.dataStore).scheduleList); },
          err => { alert('錯誤!'); }
        );
      }
    );
  }
  addNew(){
    this.list.take(1).subscribe(
      arr => {
        //let rdnDataset = Array.from( new Array(24), ()=>(this.getRandomInt(0,30)) );
        let rdnDataset = Array.from( new Array(24), ()=>(0) );
        let rdnColor = Array.from( new Array(24), ()=>('rgb(200,200,200)') );
        arr.push({
          "name":'排程',
          "chartDatas":{
            "colors": [ {borderColor: 'rgba(72,138,255,0.5)'},rdnColor],
            //"datasets": [this.getRandomDatasetZero()]
            "datasets": [ 
              {data:rdnDataset,type:'line'},
              {data:rdnDataset} ]
          },
          "lastModified":new Date().getTime(),
          /*"sectionsList":[
            
          ],*/
          "sectionsList":Array.from({length:24},(v,i)=>({"mode":1,
            "time":'',
            "time_num":[i,0],  // [ HOUR , MIN ]
            "multiple":0})
          ),/*
          "sectionsList":[
            {
              "mode":1,
              "time":'',
              "time_num":[0,0],  // [ HOUR , MIN ]
              "multiple":0
            }, {
              "mode":1,
              "time":'',
              "time_num":[23,0],  // [ HOUR , MIN ]
              "multiple":0
            },
            
          ],*/
          "checks": Array.from({length:12},v=>false),

          "dateRange":[0,23]
        });
        console.log(arr);
        let tempSetOb = Observable.fromPromise(this.storage.setItem(_STORAGE_SCHEDULE_NAME,arr));
        tempSetOb.subscribe(
          scc => { this._list.next(Object.assign({}, this.dataStore).scheduleList); },
          err => { alert('錯誤!'); }
        );
      }
    );
  }

  /* */
  gChartColorsSet(backgroundColor:Array<string>){
    return [{},{"backgroundColor":backgroundColor}];
  }
  dateRangeToString(dateRange:Array<number>){
    if(dateRange[0] <0 || dateRange[1]<0) return '空';
    else return this.dateHourNumberToString(dateRange[0]) + 
      '~' + 
      this.dateHourNumberToString(dateRange[1])
  }
  dateRangeToStringObj(range:Array<number>){
    return {
      start: this.dateHourNumberToString(range[0]),
      end: this.dateHourNumberToString(range[1]),
    }
  }
  dateHourNumberToString(hour:number){
    return ((hour<0||hour>23||(!hour&&hour!==0))? '' : (((hour<10&&hour>=0)?('0'+hour):hour)+':00'));
  }

  getRandomDatasetArr(){
    return {
      "data": Array.from( new Array(24), ()=>(this.getRandomInt(0,100)) ),
    }
  }

  getRandomDatasetZero(){
    return {
      "data": Array.from( new Array(24), ()=>(0) )
    }
  }
  getRandomColorsArr(){
    return {
      "backgroundColor":
        Array.from(new Array(24) , (val,idx) => (this.lightsColor[this.getRandomInt(0,5)]) )
    }
  }
  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

}
