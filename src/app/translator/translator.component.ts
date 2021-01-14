import { Component, OnInit } from '@angular/core';
import { DataService } from '../shared/data.service'


@Component({
  selector: 'app-translator',
  templateUrl: './translator.component.html',
  styleUrls: ['./translator.component.css']
})
export class TranslatorComponent implements OnInit {
  public loaded = false;

  public selectedInputLang: string;
  public selectedOutputLang: string;
  public availableLang = ['en', 'de'];

  public recordingBool = false;
  public playbackBool = false;

  // boolean which disabled btn when new file gets recorded of recording gets replayed
  public recordingAction = false;

  // checks if at least one audio file was recorded
  public recordingFinished = false;


  // translation logic
  public selectedRecForTransl: string;
  public availableRecordingFilenames: string[];

  public fetchingRecordingsBool = false;
  public translationComplete = false;
  public translatingBool = false;



  public sourceLang = '';
  public translatedLang = '';

  public sourceText = '';
  public translatedText = '';

  public ttsFiles: {src: string, dest: string};
  public playbackTTSsourceBool = false;
  public playbackTTStranslationBool = false;

  constructor(
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.onFetchRecordings().then(loaded => {
      if(loaded) {
        this.loaded = true;
      }
    })
  }



  public onSelectionChange(lang: string, type: 'in' | 'out') {
    switch (type) {
      case 'in':
        this.selectedInputLang = lang;
        this.selectedOutputLang = this.availableLang.find(availLang => availLang !== lang);
        break;

      case 'out':
        this.selectedOutputLang = lang;
        this.selectedInputLang = this.availableLang.find(availLang => availLang !== lang);
        break;

      default:
        this.selectedInputLang = '';
        this.selectedOutputLang = '';
        break;
    }
  }

  public onAudioSelectionChange(audioFile: string) {
    this.selectedRecForTransl = audioFile;
  }



  public onRecording() {
    this.recordingBool = !this.recordingBool;
    this.recordingFinished = false;
    this.recordingAction = true;

    this.dataService.openSnackBar('recording started', 'ok');

    // sent request to service for starting recording
    this.dataService.recordInput({in: this.selectedInputLang, out: this.selectedOutputLang}, this.recordingBool)
    .then(recordInputResponse => {
      this.recordingAction = false;
      this.dataService.openSnackBar('recording stopped', 'ok');


      if (recordInputResponse['request'] == 'recording stop') {
        this.recordingBool=false;
        this.recordingFinished = true;

        // after each recording the list with recordings gets refreshed
        if(recordInputResponse['data']) {
          this.availableRecordingFilenames = [...recordInputResponse['data'].split(',')]
          this.selectedRecForTransl = [...this.availableRecordingFilenames].pop();
        }
      }
    });
  }


  onPlayback(filename?: string) {
    this.playbackBool = !this.playbackBool;

    if(!filename) {
      this.recordingAction = true;
    }

    this.dataService.openSnackBar('playback started', 'ok');

    // sent request to service for starting recording
    this.dataService.playRecording(this.playbackBool, filename)
    .then(playbackResponse => {
      if (playbackResponse == 'playback pause') {
        this.playbackBool = false;

        this.dataService.openSnackBar('playback stopped', 'ok');

        if(!filename) {
          this.recordingAction = false;
        }
      }
    });
  }


  onPlaybackTTS(text: 'source' | 'translation') {
    let pathToFile;

    if(text == 'source') {
      this.playbackTTSsourceBool = true;
      pathToFile = this.ttsFiles.src;
    } else if (text === 'translation') {
      this.playbackTTStranslationBool = true;
      pathToFile = this.ttsFiles.dest;
    }

    this.dataService.openSnackBar('TTS playback started', 'ok');

    // sent request to service for starting recording
    this.dataService.playTTS(pathToFile)
    .then(playTTSResponse => {
      if (playTTSResponse == 'TTS playback stop') {
        text == 'source' ? this.playbackTTSsourceBool = false : this.playbackTTStranslationBool = false;

        this.dataService.openSnackBar('TTS playback stopped', 'ok');
      }
    });
  }


  onDeleteRecordings() {
    this.recordingBool = false;
    this.playbackBool = false;
    this.recordingFinished = false;

    // sent request to service to delete all translations & all recordings
    this.onDeleteTranslations();

    this.dataService.deleteAllRecordings()
    .then(deleteResponse => {
      if (deleteResponse == 'delete complete') {
        this.dataService.openSnackBar('all recordings deleted', 'ok');

        setTimeout(() => {
          this.onFetchRecordings();
        }, 1000);
      }
    });
  }


  onTranslate(selectedRecForTransl) {
    this.translatingBool = true;

    this.dataService.openSnackBar('translation started', 'ok');

    this.dataService.translateRecording(selectedRecForTransl)
    .then(translateResponse => {
      this.translatingBool = false;
      this.translationComplete = true;


      console.log(translateResponse['data']);

      if(translateResponse['data']) {
        if(translateResponse['data'] === 'speech recognition failed') {
          this.ttsFiles = {src: '', dest: ''}
          this.sourceLang = 'undefined';
          this.translatedLang = 'undefined';
          this.sourceText = ''
          this.translatedText = ''

          this.dataService.openSnackBar(translateResponse['data'], 'ok');
        } else {
          let data = JSON.parse(translateResponse['data']);
          let srcLang = data['srcFilename'].split('.')[1]

          this.ttsFiles = {src: data['filenameSrc'], dest: data['filenameDest']}

          this.sourceLang = srcLang == 'en' ? 'English' : 'German';
          this.translatedLang = srcLang == 'en' ? 'German' : 'English';

          this.sourceText = data['textSrc'];
          this.translatedText = data['textDest'];

          this.dataService.openSnackBar('translation finished', 'ok');
        }
      }
    });
  }

  onDeleteTranslations() {
    this.dataService.deleteAllTranslations()
    .then(deleteResponse => {
      if (deleteResponse == 'delete complete') {
        this.dataService.openSnackBar('all translations deleted', 'ok');

        this.translationComplete = false;
        this.ttsFiles = null;

        this.sourceLang = '';
        this.translatedLang = '';

        this.sourceText = '';
        this.translatedText = '';
      }
    })
  }



  // fetching recordings which are on the server available
  onFetchRecordings() {
    this.fetchingRecordingsBool = true;
    this.selectedRecForTransl = '';

    this.dataService.openSnackBar('fetching recordings', 'ok');

    // sent request to service to fetch info from backend
    return this.dataService.fetchRecordings()
    .then(fetchResponse => {
      if(fetchResponse) {
        this.availableRecordingFilenames = (fetchResponse as String).split(",");
        this.selectedRecForTransl = [...this.availableRecordingFilenames].pop();
        this.dataService.openSnackBar('recordings fetched', 'ok');
      } else {
        this.availableRecordingFilenames = [];
        this.dataService.openSnackBar('no recordings to fetch', 'ok');
      }

      this.fetchingRecordingsBool = false;

      return true;
    })
  }

}
