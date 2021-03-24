import { Component, ElementRef, OnInit, ViewChild,QueryList,ViewChildren } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { SendMsgsService } from '../../services/send-msgs.service';
import { AudioOptionsService } from '../../services/audio-options.service';
import * as RecordRTC from 'recordrtc';
import { DomSanitizer } from '@angular/platform-browser';
import { state, style, transition, trigger, animate } from '@angular/animations';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { LoaderService } from '../../services/loader.service';


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

  constructor(private sendMsgServ: SendMsgsService, 
    private audioOpt: AudioOptionsService, 
    private domSanitizer: DomSanitizer,
    public servicioCarga:LoaderService ) {
    
    
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
      userid: new FormControl(this.userID),
      fechauser: new FormControl()

    });
    this.EntradaAudio = new FormGroup({
      audioFile:new FormControl()
    })
    this.userID = sendMsgServ.userID;
  }
  sanitize(url:string){
    console.log(this.domSanitizer.bypassSecurityTrustUrl(url));
    return this.domSanitizer.bypassSecurityTrustUrl(url);
}

  async ngOnInit(): Promise<void> {
    //Analizo si tengo datos guardados en mi local storage...
    let almacenaje = localStorage.getItem('BufferRespuestas');
    if(almacenaje === undefined || almacenaje == null){
      //Significa que no tenemos ningun dato guardado en nuestra base de datos local...
      console.log('Entramos a condicional para crear el item del localstorage...');
      //Recibimos mensaje de la base de datos... 
      var PrimerMensaje = await this.sendMsgServ.recieveMsg();
      this.respuestas.push(PrimerMensaje);
      console.log("Se realizo el push del primer mensaje de manera correcta, almacenamos respuesta en el local storage..");
      localStorage.setItem('BufferRespuestas',JSON.stringify(this.respuestas));
      console.log("Primer seteo de local storage exitoso");
    }else{
      // Buscamos el valor del local storage de las preguntas que se han realizado..
      console.log('Entramos al else, se hace el codicional de llamar a las respuestas almacenadas en el local storage');
      this.respuestas = JSON.parse(localStorage.getItem('BufferRespuestas'));
      this.scrollAlUltimoMensaje();
      //Actualizamos el valor del contador
      this.contador=this.respuestas.length-1;
      console.log(this.contador);
      
    }
    console.log(this.userID);
    // Recibo el mensaje predeterminado de mis datos.
    
  }
  ngAfterViewChecked(){
    this.scroll = this.viewport.getElementRef;
  }

  async enviarMensaje(){
    this.respuestas[this.contador].user.texto = this.formularioMensajes.value.texto;
    this.respuestas[this.contador].user.estado = this.formularioMensajes.value.estado;
    this.respuestas[this.contador].user.fecha = new Date();
    this.formularioMensajes.value.fechauser = new Date();
    this.formularioMensajes.value.userid = this.userID;
    this.scrollAlUltimoMensaje();
    this.contador ++;
    //this.arrMensajesUsuario.push(this.formularioMensajes.value);

    try{
      
      const response = await this.sendMsgServ.sendMsg(this.formularioMensajes.value);
      this.respuestas.push(response);
      // Actualizamos el localstorage ...
      localStorage.setItem('BufferRespuestas',JSON.stringify(this.respuestas));
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
    this.recording = false;
    this.record.stop(this.processRecording.bind(this));
    
  }

  async processRecording(blob) {
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
    localStorage.setItem('BufferRespuestas',JSON.stringify(this.respuestas));
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
