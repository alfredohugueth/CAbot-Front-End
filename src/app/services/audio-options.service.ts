import { Injectable } from '@angular/core';
import * as RecordRTC from 'recordrtc';
import { DomSanitizer } from '@angular/platform-browser';
import { SendMsgsService } from './send-msgs.service';

@Injectable({
  providedIn: 'root'
})
export class AudioOptionsService {
  private record;
  private error;
  recording = false;
  temp: any;
  

  constructor(private domSanitizer: DomSanitizer, private sendMsgs: SendMsgsService) { 
    this.temp = 0;
  }
  sanitize(url:string){
    return this.domSanitizer.bypassSecurityTrustUrl(url);
}
  // Reproducir audio de respuesta
  playByteArray(byteArray) {
    var arrayBuffer = new ArrayBuffer(byteArray.length);
    var bufferView = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteArray.length; i++) {
      bufferView[i] = byteArray[i];
    }
    let context = new AudioContext();
    context.decodeAudioData(
      arrayBuffer,
      function(buffer) {
        this.play(buffer);
      }.bind(this)
    );
  }

  play(buf) {
    // Create a source node from the buffer
    let context = new AudioContext();
    var source = context.createBufferSource();
    source.buffer = buf;
    // Connect to the final output node (the speakers)
    source.connect(context.destination);
    // Play immediately
    source.start(0);
  }

  // Interactuar con audio de entrada.
  IniciaGrabacion(){
    this.recording = true;
        let mediaConstraints = {
            video: false,
            audio: true
        };
        navigator.mediaDevices
            .getUserMedia(mediaConstraints)
            .then(this.successCallback.bind(this), this.errorCallback.bind(this));
  }

  successCallback(stream) {
    var options = {
        mimeType: "audio/wav",
        numberOfAudioChannels: 1,
        desiredSampRate: 16000,
    };
    //Start Actuall Recording
    var StereoAudioRecorder = RecordRTC.StereoAudioRecorder;
    this.record = new StereoAudioRecorder(stream, options);
    this.record.record();
}

  async detenGrabacion(){
    var blob;
    var condi = false;
    this.recording = false;
    await this.record.stop(await this.getBlob.bind(this))
    return false;
    };//this.procesaGrab.bind(this));
  
  getBlob(blob){
    console.log(this.temp);
    const formData = new FormData();
    formData.append('pregunta',blob,'audio.wav');
    this.temp = formData;
    console.log(this.temp);
  }

  recibeBlob(){
    console.log(this.temp);
    return this.temp;
  }


errorCallback(error) {
  this.error = error;
}
  
}
