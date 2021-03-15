import { Component, ElementRef, OnInit, ViewChild,QueryList,ViewChildren } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { SendMsgsService } from '../../services/send-msgs.service';
import { AudioOptionsService } from '../../services/audio-options.service';
import * as RecordRTC from 'recordrtc';
import { DomSanitizer } from '@angular/platform-browser';
import { state, style, transition, trigger, animate } from '@angular/animations';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';


@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.css']
})
export class ChatBoxComponent implements OnInit {
  @ViewChild(CdkVirtualScrollViewport)
  viewport: CdkVirtualScrollViewport;
  //Lets initiate Record OBJ
  private record;
  //Will use this flag for detect recording
  recording = false;
  //Url of Blob
  url;
  private error;
  formularioMensajes: FormGroup;
  EntradaAudio: FormGroup;
  arrMensajesBot: any[];
  arrMensajesUsuario: string[];
  respuestas: any[];
  contador: number;
  userID:string;
  audio: any;
  prueba: any;
  scrollContainer: any;
  scroll: any;

  constructor(private sendMsgServ: SendMsgsService, private audioOpt: AudioOptionsService, private domSanitizer: DomSanitizer) {
    
    
    this.arrMensajesBot = [];
    this.arrMensajesUsuario = [];
    this.respuestas = [];
    this.contador = 0;
    this.audio = {};
    this.prueba = {};
    this.formularioMensajes = new FormGroup({
      estado: new FormControl(true),
      emisor: new FormControl('usuario'),
      texto: new FormControl(''),
      userid: new FormControl(this.userID)

    });
    this.EntradaAudio = new FormGroup({
      audioFile:new FormControl()
    })
    this.userID = sendMsgServ.userID;
    console.log(this.userID);
    console.log(this.recording);
    console.log(this.scroll);
  }
  sanitize(url:string){
    console.log(this.domSanitizer.bypassSecurityTrustUrl(url));
    return this.domSanitizer.bypassSecurityTrustUrl(url);
}

  ngOnInit(): void {
    
    this.sendMsgServ.recieveMsg()
      .then(msgs => {
        this.respuestas.push(msgs);
        console.log(msgs);
        //this.arrMensajesBot.push(msgs)
      })
      .catch(error => console.log(error));
  }
  ngAfterViewChecked(){
    this.scroll = this.viewport.getElementRef;
    console.log(this.scroll);
  }

  async enviarMensaje(){
    this.respuestas[this.contador].user.texto = this.formularioMensajes.value.texto;
    this.respuestas[this.contador].user.estado = this.formularioMensajes.value.estado;
    this.respuestas[this.contador].user.fecha = new Date();
    this.scrollAlUltimoMensaje();
    this.contador ++;
    //this.arrMensajesUsuario.push(this.formularioMensajes.value);

    try{
      const response = await this.sendMsgServ.sendMsg(this.formularioMensajes.value,this.userID);
      console.log(response);
      this.respuestas.push(response);
      this.audioOpt.playByteArray(response.boot.voz.data);
      this.scrollAlUltimoMensaje();
      } catch(error) {
        console.log(error);
      }

    this.formularioMensajes = new FormGroup({
      estado: new FormControl(true),
      emisor: new FormControl('usuario'),
      texto: new FormControl(''),
      userid: new FormControl(this.userID)

    })
    
    
  }

  

  grabar(){
    console.log("Empieza la grabación");
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

  pararGrabar(){
    console.log("Se detiene la grabación");
    this.recording = false;
    this.record.stop(this.processRecording.bind(this));
    
  }

  async processRecording(blob) {
    console.log(this.record);
    const formData = new FormData();
    formData.append('pregunta',blob,'audio.wav');
    formData.append('id',this.userID);
    try{
    const audioResponse = await this.sendMsgServ.sendAudio(formData); 
    // Enviamos los datos al chat de lo que dice el usuario.
    this.respuestas[this.contador].user.texto = audioResponse.user.texto;
    this.respuestas[this.contador].user.estado = true;
    this.scrollAlUltimoMensaje();
    this.contador ++;
    // Enviamos los datos al char de los que dice el bot.
    this.respuestas.push(audioResponse);
    this.audioOpt.playByteArray(audioResponse.boot.voz.data);
    this.scrollAlUltimoMensaje();
    }catch(err){
      console.log(err);
    }

}

scrollAlUltimoMensaje(){
  
   setTimeout(()=>{
     this.viewport.scrollToIndex(this.contador);
     this.viewport.scrollTo({
       bottom:0,
       behavior:'smooth',
     });
   },0);
   setTimeout(()=>{
     this.viewport.scrollTo({
       bottom:0,
       behavior:'smooth'
     });
   },50);
}


  

  errorCallback(error) {
    this.error = 'Can not play audio in your browser';
}
  

}
