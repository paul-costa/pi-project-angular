import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RestService } from './rest.service'

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(
    private restService: RestService,
    private _snackBar: MatSnackBar,
  ) { }


  public recordInput(langObj: {in: string, out: string}, start: boolean) {
    return new Promise((resolve, reject) => {
      this.restService.recording(langObj, start ? 'start' : 'stop').subscribe(result => {
        resolve(result)
      });
    });
  }


  public playRecording(playPause: boolean, filename?: string) {
    return new Promise((resolve, reject) => {
      // playback was started
      this.restService.playback(playPause ? 'play' : 'pause', filename).subscribe(result => {
        resolve(result['request'])
      });
    });
  }

  public deleteAllRecordings() {
    return new Promise((resolve, reject) => {
      // delete all was started
      this.restService.deleteAllRecordings().subscribe(result => {
        resolve(result['request'])
      });
    });
  }


  public fetchRecordings() {
    return new Promise((resolve, reject) => {
      this.restService.fetchRecordings().subscribe(result => {
        setTimeout(() => {        // little artificial server timeout
          resolve(result['data']);
        }, 1000);
      });
    });
  }




  // translations methods
  public translateRecording(filename: string) {
    return new Promise((resolve, reject) => {
      this.restService.translateRecording(filename).subscribe(result => {
          resolve(result);
      });
    });
  }

  public deleteAllTranslations() {
    return new Promise((resolve, reject) => {
      // delete all was started
      this.restService.deleteAllTranslations().subscribe(result => {
        resolve(result['request'])
      });
    });
  }

  public playTTS(pathToFile: string) {
    return new Promise((resolve, reject) => {
      // playback was started
      this.restService.playTTS(pathToFile).subscribe(result => {
        resolve(result['request'])
      });
    });
  }


  // helper methods
  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 1000,
    });
  }
}
