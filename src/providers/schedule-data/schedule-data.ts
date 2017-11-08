import { Injectable } from '@angular/core';
import { NativeStorage } from '@ionic-native/native-storage';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/observable/fromPromise';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { LightsInfoProvider } from '../../providers/lights-info/lights-info'
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
  dateRangeToStringObj(range:Array<number>){
    if(!(range[0]==null)||!(range[1]==null)){
      return {
        start: '',
        end: '',
      }
    }else{
      return {
        start: (((range[0]<10)?('0'+range[0]):range[0]) + ':00'),
        end: (((range[1]<10)?('0'+range[1]):range[1]) + ':00'),
      }
    }
    
  }
  detectDateRange(range:Array<number>,scheIdx:number){
    let isInRange = false;
    return Observable.create(
      observer => {
        this.list.take(1).subscribe(
          arr => {
            let isRepeat = arr.find(
              (ss,idx)=>{
                if(idx==scheIdx)return false;
                if(range[0]<ss.dateRange[0]){
                  if(range[1]>=ss.dateRange[0]){
                    return true;
                  }else{
                    return false;
                  }
                }else if(range[0] == ss.dateRange[0]){
                  return true;
                }else{  // range[0] > ss.dateRange[0]
                  if(range[0]<=ss.dateRange[1]){
                    return true;
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
  sectionsToCharts(sections:Array<sectionDataType>,dateRange){
    let chart = {
      "data":[],
      "backgroundColor": []
    }
    for(let i =0;i<24;i++){
      if(i>=dateRange[0] && i<=dateRange[1]){
        let tmp = sections[i-dateRange[0]];
        chart.data.push((tmp.multiple==0)?-1:tmp.multiple);
        chart.backgroundColor.push(this.lightsColor[ tmp.mode-1 ]);
      }else{
        chart.data.push(0);
        chart.backgroundColor.push('rgb(0,0,0)');
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
              "datasets": [{"data":chart.data},{"data":chart.data}],
              "colors":[{"backgroundColor":chart.backgroundColor}]
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
        arr.push({
          "name":'排程',
          "chartDatas":{
            "colors": [this.getRandomColorsArr()],
            "datasets": [this.getRandomDatasetZero()]
            
          },
          "lastModified":new Date().getTime(),
          "sectionsList":[],
          "checks":[false,false,false,false,false,false],

          "dateRange":[null,null]
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

  getRandomDatasetArr(){
    return {
      "data": Array.from( new Array(24), ()=>(this.getRandomInt(0,100)) )
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
