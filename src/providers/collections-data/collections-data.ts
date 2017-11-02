import { PipeTransform,Pipe,Injectable } from '@angular/core';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/observable/fromPromise';
import { Observable } from 'rxjs/Observable';
import { NativeStorage } from '@ionic-native/native-storage';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
const _STORAGE_COLLECTIONS_NAME = "collectionsList";
export interface collectionType {
  "name":string,
  "cid": number,
  "devices":Array<number>,  // deviceType -> group
}
@Injectable()
export class CollectionsDataProvider {
  list:Observable<collectionType[]>;
  private _list:BehaviorSubject<collectionType[]>;
  dataStore:{
    "collectionList": Array<collectionType>
  }

  constructor(
    private storage:NativeStorage
  ) {
    this._list = <BehaviorSubject<collectionType[]>>new BehaviorSubject([]);
    this.list = this._list.asObservable();
    this.dataStore = {
      "collectionList": []
    }
    console.log('>>>> CollectionsDataProvider');
    this.loadAll();
  }
  loadAll(){
    Observable.fromPromise(this.storage.getItem(_STORAGE_COLLECTIONS_NAME)).subscribe(
      (arr)=>{
        if(typeof arr != 'object') JSON.parse(arr);
        this.dataStore.collectionList = arr;
        this._list.next(Object.assign({}, this.dataStore).collectionList);
      },
      (err)=>{
        if(err.code==2 || err.code.code==2){
          let temp = Array.from({length: 6}, 
            (v, i) => ({
                "name":"群組"+ String.fromCharCode(64 + i+1),
                "cid": (i+1),
                "devices":[]
              })
          );

          Observable.fromPromise(this.storage.setItem(_STORAGE_COLLECTIONS_NAME,temp))
            .subscribe();
          this.dataStore.collectionList = temp;
          this._list.next(Object.assign({}, this.dataStore).collectionList);
        }else{
          alert("錯誤" + JSON.stringify(err));
        }
      }
    );
  }
  getByCid(cid:number){
    return Observable.create(
      observer => {
        this.list.subscribe(
          arr => {
            observer.next(
              arr.filter(
                (v,i)=>(v.cid == cid)
              )
            );
            
          }
        );
      }
    ); 
  }
  modify(cid:number,devices:Array<any>){
    return Observable.create(
      observer => {
        this.list.take(1).subscribe(
          arr => {
        
            for(let v of arr){
              if(v.cid==cid){
                v.devices=devices;
              }
            }
            console.log(arr);
            this.dataStore.collectionList = arr;
            Observable
              .fromPromise(this.storage.setItem(_STORAGE_COLLECTIONS_NAME,arr))
              .subscribe(
                (res)=>{
                  this._list.next(Object.assign({}, this.dataStore).collectionList);
                  console.log('>>>> _STORAGE_COLLECTIONS_NAME SAVE!');
                  observer.next(true);
                  observer.complete();
                }
                  
              );

          }
        );
      }
    ); 
  }

}
@Pipe({
  name: 'collection_name',
  pure: false
})
export class collectionNamePipe implements PipeTransform {
  constructor(){
  }
  transform(value, args) {
    let clName = [
      '無群組',"群組A","群組B","群組C","群組D","群組E","群組F",
    ]
    let slug = [
      '',"A","B","C","D","E","F",
    ]
    //value.map( v => clName[v] ).toString();
    return (value)?((args)?slug[value]:clName[value]):'無';
  }
}