import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { backendUrl } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RestService {
  public headers = { 'content-type': 'application/json'}

  constructor(
    private http: HttpClient,
  ) { }

  public recording(langObj: {in: string, out: string}, startStop: 'start' | 'stop') {
    const bodyStr = {
      langObj,
      startOrStopRecording: startStop,
      playOrPauseAudio: "null",
      filename: "null",
      deleteAll: "null"
    };

    return this.http.post(backendUrl + 'recordings', JSON.stringify(bodyStr), {'headers': this.headers});
  }



  public playback(playPause: 'play' | 'pause', filename?: string) {
    const bodyStr = {
      langObj: {},
      startOrStopRecording: "null",
      playOrPauseAudio: playPause,
      filename: filename ? filename : "last",
      deleteAll: "null"
    };

    return this.http.post(backendUrl + 'recordings', JSON.stringify(bodyStr), {'headers': this.headers});
  }

  public deleteAllRecordings() {
    const bodyStr = {
      langObj: {},
      startOrStopRecording: "null",
      playOrPauseAudio: "null",
      filename: "null",
      deleteAll: "true"
    };

    return this.http.post(backendUrl + 'recordings', JSON.stringify(bodyStr), {'headers': this.headers});
  }



  // get requests
  public fetchRecordings() {
    return this.http.get(backendUrl + 'recordings', {'headers': this.headers});
  }




  // translation requests
  public translateRecording(filename: string) {
    const bodyStr = {
      filename: filename,
      deleteAll: "false"
    };

    return this.http.post(backendUrl + 'translations', JSON.stringify(bodyStr), {'headers': this.headers});
  }


  public deleteAllTranslations() {
    const bodyStr = {
      filename: undefined,
      deleteAll: "true"
    };

    return this.http.post(backendUrl + 'translations', JSON.stringify(bodyStr), {'headers': this.headers});
  }


  public playTTS(pathToFile) {
    return this.http.post(backendUrl + 'tts', JSON.stringify({pathToFile: pathToFile}), {'headers': this.headers});
  }
}
