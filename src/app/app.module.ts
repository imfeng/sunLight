import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';

import { FormsModule } from '@angular/forms';
import { BLE } from '@ionic-native/ble';
//import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { AndroidPermissions } from '@ionic-native/android-permissions';

import { HttpModule } from '@angular/http';

/* COMPONENT */
import { MyApp } from './app.component';
//import { ComponentsModule } from '../components/components.module';

//import { TabsPage } from '../pages/tabs/tabs';
import { TabsPageModule } from '../pages/tabs/tabs.module';
import { CollectionsModule } from '../providers/collections-data/collections-data.module';
/* IONIC NATIVE */
import { WheelSelector } from '@ionic-native/wheel-selector';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { NativeStorage } from '@ionic-native/native-storage';

/* PROVIDERS */

import { ToastCtrlProvider } from '../providers/toast-ctrl/toast-ctrl';
import { BleCtrlProvider } from '../providers/ble-ctrl/ble-ctrl';
import { BleCommandProvider } from '../providers/ble-command/ble-command';
import { DevicesDataProvider } from '../providers/devices-data/devices-data';
import { ScheduleDataProvider } from '../providers/schedule-data/schedule-data';
import { AppStateProvider } from '../providers/app-state/app-state';

import { ScreenOrientation } from '@ionic-native/screen-orientation';

import { EyeCheckPageModule } from '../pages/eye-check/eye-check.module'

@NgModule({
  declarations: [
    //NumberPickerComponent,
    //LightsChartComponent,
    /*editDevicePage,
    ModeDevicesPage,
    DevMode,editDevSettingPage,
    TabsPage,*/
    MyApp,
  ],
  exports:[
  //NumberPickerComponent,
   //LightsChartComponent
  ],
  imports: [
    EyeCheckPageModule,
    //ComponentsModule,
    HttpModule,
    TabsPageModule,
    /*ModeSchedulePageModule,
    ModeManualModule,*/
    FormsModule,
    BrowserModule,
    IonicModule.forRoot(MyApp),
    CollectionsModule


    //BleOperatorPageModule

  ],
  bootstrap: [IonicApp],
  entryComponents: [
    /*TabsPage,
    editDevicePage,
    ModeDevicesPage,
    DevMode,editDevSettingPage,*/
    MyApp,

  ],
  providers: [
    ScreenOrientation,
    AndroidPermissions,
    BLE,
    NativeStorage,
    WheelSelector,
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    ToastCtrlProvider,
    BleCtrlProvider,
    BleCommandProvider,
    DevicesDataProvider,
    ScheduleDataProvider,
    AppStateProvider

  ]
})
export class AppModule {}
