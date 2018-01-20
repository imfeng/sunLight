import { Injectable } from '@angular/core';
import { ToastController,LoadingController } from 'ionic-angular';

@Injectable()
export class ToastCtrlProvider {

  constructor(
    public toastCtrl:ToastController,
    public loadingCtrl: LoadingController) {
  }
  showToast(message:string,ms=3000,pos='bottom'){
    let toast = this.toastCtrl.create({
      message: message,
      duration: ms,
      position: pos,
      showCloseButton:true
    });
    toast.onDidDismiss(() => {
      //console.log('Dismissed toast');
    });
    toast.present();
    return toast;
  }
  showLoading(content="Please wait...",ms=null){
    let loader = this.loadingCtrl.create({
      content: content,
    });
    if(ms){
      setTimeout(()=>{
        //fn();
      },ms);
    }
    loader.present();
    return loader;
  }

}
