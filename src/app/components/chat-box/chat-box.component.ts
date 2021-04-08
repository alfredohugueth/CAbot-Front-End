import { Component, ElementRef, OnInit, ViewChild, QueryList, ViewChildren } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { SendMsgsService } from '../../services/send-msgs.service';
import { AudioOptionsService } from '../../services/audio-options.service';
import * as RecordRTC from 'recordrtc';
import { DomSanitizer } from '@angular/platform-browser';
import { state, style, transition, trigger, animate } from '@angular/animations';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { LoaderService } from '../../services/loader.service';
import Localbase from 'localbase'


let db = new Localbase('db');


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
  userID: string;
  audio: any;
  prueba: any;
  scrollContainer: any;
  scroll: any;
  imagenExiste: boolean;
  imagen:string;
  fondoImagen:string;

  constructor(private sendMsgServ: SendMsgsService,
    private audioOpt: AudioOptionsService,
    private domSanitizer: DomSanitizer,
    public servicioCarga: LoaderService) {
    this.fondoImagen = '';
    this.imagenExiste = false;
    this.imagen = '';
    this.arrMensajesBot = [];
    this.arrMensajesUsuario = [];
    this.respuestas = [];
    this.contador = 0;
    this.audio = {};
    this.prueba = {};
    this.formularioMensajes = new FormGroup({
      estado: new FormControl(true),
      emisor: new FormControl('usuario'),
      texto: new FormControl(),
      userid: new FormControl(this.userID),
      fechauser: new FormControl()

    });
    this.EntradaAudio = new FormGroup({
      audioFile: new FormControl()
    })
    this.userID = sendMsgServ.userID;
  }
  sanitize(url: string) {
    console.log(this.domSanitizer.bypassSecurityTrustUrl(url));
    return this.domSanitizer.bypassSecurityTrustUrl(url);
  }

  async ngOnInit(): Promise<void> {
    //Analizo si tengo datos guardados en mi local storage...
    let almacenaje = localStorage.getItem('BufferRespuestas');
    db.collection('respuestas').get().then(async(respuestas) => {
      console.log(respuestas);
      //Verificamos si el array es vacio ...
      // en caso tal, creamos la entrada:
      if (respuestas.length === 0) {
        console.log('Database local vacio');
        //creamos la entrada en el localdatabase ...
        console.log('Entramos a condicional para crear el item del indexDB...');
        //Recibimos mensaje de la base de datos...
        var PrimerMensaje = await this.sendMsgServ.recieveMsg();
        this.respuestas.push(PrimerMensaje);
        console.log("Se realizo el push del primer mensaje de manera correcta, almacenamos respuesta en el local storage..");
        db.collection('respuestas').add({});
        db.collection('respuestas').set(this.respuestas);
        console.log("Primer seteo de local storage exitoso");
      }else{
        //Llamamos a la database para setear los valores obtenidos anteriormente
        console.log('DB no vacio');
        //Llamamos el array almacenado .
        this.respuestas =respuestas;
        this.scrollAlUltimoMensaje();
      //Actualizamos el valor del contador
        this.contador = this.respuestas.length - 1;

      }

    })


  }
  ngAfterViewChecked() {
    this.scroll = this.viewport.getElementRef;
  }

  async enviarMensaje() {
    //Verificamos que el campo no este vacio de texto no este vacio ...
    if (this.formularioMensajes.value.texto.trim() === '') {
      //significa que estoy enviando un campo de texto sin ningun parametro.

      alert('Ingresa tu pregunta por favor');

    } else {

      this.respuestas[this.contador].user.texto = this.formularioMensajes.value.texto;
      this.respuestas[this.contador].user.estado = this.formularioMensajes.value.estado;
      this.respuestas[this.contador].user.fecha = new Date();
      this.formularioMensajes.value.fechauser = new Date();
      this.formularioMensajes.value.userid = this.userID;
      this.scrollAlUltimoMensaje();
      this.contador++;
      //this.arrMensajesUsuario.push(this.formularioMensajes.value);

      try {

        const response = await this.sendMsgServ.sendMsg(this.formularioMensajes.value);
        //Verificamos que la respuesta venga o no con imagen...
        if(response.boot.imagen){
          this.imagenExiste = true;
          this.imagen = response.boot.imagen;
          this.fondoImagen = response.boot.imagen;
          response.boot.imagenExiste = this.imagenExiste;
        }
        this.respuestas.push(response);
        

        // localStorage.setItem('BufferRespuestas', JSON.stringify(this.respuestas));
        this.audioOpt.playByteArray(response.boot.voz.data);
        this.scrollAlUltimoMensaje();
        // Actualizamos El valor del database ...
        db.collection('respuestas').set(this.respuestas);
      } catch (error) {
        console.log(error);
      }

      this.formularioMensajes = new FormGroup({
        estado: new FormControl(true),
        emisor: new FormControl('usuario'),
        texto: new FormControl(),
        userid: new FormControl(this.userID)

      })

    }
  }



  grabar() {
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

  pararGrabar() {
    this.recording = false;
    this.record.stop(this.processRecording.bind(this));

  }

  async processRecording(blob) {
    const formData = new FormData();
    formData.append('pregunta', blob, 'audio.wav');
    formData.append('id', this.userID);
    try {
      const audioResponse = await this.sendMsgServ.sendAudio(formData);
      // Enviamos los datos al chat de lo que dice el usuario.
      this.respuestas[this.contador].user.texto = audioResponse.user.texto;
      this.respuestas[this.contador].user.estado = true;
      this.scrollAlUltimoMensaje();
      this.contador++;
      // Enviamos los datos al char de los que dice el bot.
      this.respuestas.push(audioResponse);
      //localStorage.setItem('BufferRespuestas', JSON.stringify(this.respuestas));
      this.audioOpt.playByteArray(audioResponse.boot.voz.data);
      this.scrollAlUltimoMensaje();
      //seteamos el nuevo valor 
    } catch (err) {
      console.log(err);
    }

  }

  scrollAlUltimoMensaje() {

    setTimeout(() => {
      this.viewport.scrollToIndex(this.contador);
      this.viewport.scrollTo({
        bottom: 0,
        behavior: 'smooth',
      });
    }, 0);
    setTimeout(() => {
      this.viewport.scrollTo({
        bottom: 0,
        behavior: 'smooth'
      });
    }, 50);
  }




  errorCallback(error) {
    this.error = 'Can not play audio in your browser';
  }


}
