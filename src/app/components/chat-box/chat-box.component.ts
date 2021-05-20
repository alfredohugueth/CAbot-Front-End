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
import { DOCUMENT } from '@angular/common'; 
import { Inject }  from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MoreinfoComponent } from '../youtube/moreinfo/moreinfo.component';
import { YoutubeServiceService } from 'src/app/services/youtube-service.service';


let db = new Localbase('db');


@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.css']
})
export class ChatBoxComponent implements OnInit {
  @ViewChild(CdkVirtualScrollViewport)
  public viewport: CdkVirtualScrollViewport;
  
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
  mostrarBotonesMasPreguntas:boolean;
  mostrarInputs:Boolean;
  quieroCalificar:Boolean[];
  preguntaCalificar:Boolean;
  respuestaCalificar:Boolean;
  scrollInput:HTMLElement;
  segundos:number;
  funcionContar:any;
  contadorMensajes:number
  controladorAudio : Boolean[];
  controllerInput: Boolean;

  constructor(private sendMsgServ: SendMsgsService,
    private audioOpt: AudioOptionsService,
    private domSanitizer: DomSanitizer,
    public servicioCarga: LoaderService,
    @Inject(DOCUMENT) document,
    public dialog: MatDialog,
    private youtubeService:YoutubeServiceService) {
    this.fondoImagen = '';
    this.imagenExiste = false;
    this.imagen = '';
    this.arrMensajesBot = [];
    this.arrMensajesUsuario = [];
    this.respuestas = [];
    this.contador = 0;
    this.audio = {};
    this.prueba = {};
    this.mostrarInputs=true;
    this.quieroCalificar = [];
    this.preguntaCalificar = false;
    this.respuestaCalificar = false;
    this.mostrarBotonesMasPreguntas=false;
    this.segundos = 0;
    this.funcionContar;
    this.contadorMensajes = 0;
    this.controllerInput = true;
    
    

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
    console.log('Primero es ngInit');
    //Analizo si tengo datos guardados en mi local storage...
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
        PrimerMensaje.boot.reproducir = false;
        this.respuestas.push(PrimerMensaje);



        console.log("Se realizo el push del primer mensaje de manera correcta, almacenamos respuesta en el local storage..");
        
        await db.collection('respuestas').set(this.respuestas);
        
        this.reproducirAudio( PrimerMensaje.boot.voz.data, this.respuestas.length-1 );

      }else{
        //Llamamos a la database para setear los valores obtenidos anteriormente
        console.log('DB no vacio');
        //Llamamos el array almacenado .
        this.respuestas =respuestas;
      //Actualizamos el valor del contador
        this.contador = this.respuestas.length-1;
        this.scrollToLast();
      }

    })


  }

  ngOnDestroy(): void {
    if ( this.audioOpt.contadorReproduccionesAudio > 0 ) this.audioOpt.stop()
  }

  scrollToLast () {
    setTimeout(() => {
      this.viewport.scrollToIndex(this.respuestas.length);
      this.viewport.scrollTo({
        bottom: 0
      });
    }, 0);
  }
  

  async enviarMensaje() {
    //Verificamos que el campo no este vacio de texto no este vacio ...
    if (this.formularioMensajes.value.texto.trim() === '') {
      //significa que estoy enviando un campo de texto sin ningun parametro.

      alert('Ingresa tu pregunta por favor');

    } else {
      this.contador = this.respuestas.length-1;
      this.respuestas[this.contador].user.texto = this.formularioMensajes.value.texto;
      this.respuestas[this.contador].user.estado = this.formularioMensajes.value.estado;
      this.respuestas[this.contador].user.fecha = new Date();
      this.formularioMensajes.value.fechauser = new Date();
      this.formularioMensajes.value.userid = this.userID;
      this.scrollAlUltimoMensaje();
      this.contador++;
      //this.arrMensajesUsuario.push(this.formularioMensajes.value);

      try {
        /* Almacenamos los datos ingresados por el usuario en el formulario */

        let body = {
          estado: this.formularioMensajes.value.estado,
          emisor: 'User',
          texto: this.formularioMensajes.value.texto,
          userid: this.userID,
          fechauser: this.formularioMensajes.value.fechauser
        }

        this.formularioMensajes = new FormGroup({
          estado: new FormControl(true),
          emisor: new FormControl('usuario'),
          texto: new FormControl(),
          userid: new FormControl(this.userID)
  
        })
        /* Escondemos el input de entrada */

        this.controllerInput = false;

        const response = await this.sendMsgServ.sendMsg(body);

        /* Mostramos nuevamente el input */

        this.controllerInput = true;
        
        /* Detengo todo audio que este anteriormente reproduciendo */
        if( this.audioOpt.contadorReproduccionesAudio > 0 ) await this.audioOpt.stop();
        this.contadorMensajes++;
        //Verifico si la respuesta viene con botón de confirmación...
        console.log('A punto de entrar a condicional');
        console.log(response);

        response.boot.reproducir = false;

        
        
        this.respuestas.push(response);


        /* Verifico si hay botones en el mensaje recibido*/
        

        // localStorage.setItem('BufferRespuestas', JSON.stringify(this.respuestas));
        this.scrollAlUltimoMensaje();
        // Actualizamos El valor del database ...
        await db.collection('respuestas').set(this.respuestas);

        /* Reproducimos el audio*/
        this.reproducirAudio( response.boot.voz.data, this.respuestas.length-1 );

      } catch (error) {
        console.log(error);
      }

      

    }
  }


  scrollToTextInput(el:HTMLElement){
    console.log(el);
    el.scrollIntoView();
  }

  
  grabar() {
    /* Inicializamos la funcion que contara cada vez que pase un segundo*/
    this.recording = true;
    let mediaConstraints = {
      video: false,
      audio: true
    };
    this.contar(true);
    if(this.segundos == 10) this.pararGrabar();
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

  enviarGrabacion() {
    this.recording = false;
    this.contar(false);
    this.segundos = 0;
    this.record.stop(this.processRecording.bind(this));

  }

  pararGrabar(){
    this.contar(false);
    this.segundos = 0
    this.recording = false;
    this.record.stop();

    
  }

  async processRecording(blob) {
    const formData = new FormData();
    formData.append('pregunta', blob, 'audio.wav');
    formData.append('id', this.userID);
    try {
      
      this.controllerInput = false;

      const audioResponse = await this.sendMsgServ.sendAudio(formData);

      this.controllerInput = true;

      // Enviamos los datos al chat de lo que dice el usuario.
      this.respuestas[this.contador].user.texto = audioResponse.user.texto;
      this.respuestas[this.contador].user.estado = true;
      this.scrollAlUltimoMensaje();
      this.contador++;
      // Enviamos los datos al char de los que dice el bot.
      this.respuestas.push(audioResponse);
      //localStorage.setItem('BufferRespuestas', JSON.stringify(this.respuestas));
      /* Guardamos datos en db */
      await db.collection('respuestas').set(this.respuestas);
      this.scrollAlUltimoMensaje();
      //seteamos el nuevo valor 
      this.reproducirAudio( audioResponse.boot.voz.data, this.respuestas.length-1 );

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
    
  }
  contar(controlador:Boolean){
    
    if(controlador){
      this.funcionContar = setInterval(()=>{
        if(this.segundos == 10) {this.contar(false)
          this.pararGrabar();
        } 
        else this.segundos++
        
      },1000)
    }else{
      console.log()
      clearInterval(this.funcionContar);
    }
    
    
  }



  errorCallback(error) {
    this.error = 'Can not play audio in your browser';
  }

  async QuieroPreguntar(){
    
    
    /* Detenemos el audio que se este ejecutando en el momento*/ 
    console.log('Quiero preguntar mas');
    /* Enviamos mensaje predeterminado a backend */
    await this.enviarMensajeMasPreguntas();
    this.mostrarInputs = true;
    this.scrollToElement();
    
  }
  NoQuieroPreguntar(){
    console.log('No quiero preguntar mas');
    this.contador = this.respuestas.length-1;
    /* Muestro botón quieres calificar */
    this.respuestas[this.contador].boot.quieroCalificar=true;
    this.preguntaCalificar = true;
    this.respuestas[this.contador].boot.MasPreguntas = false;
    this.scrollAlUltimoMensaje();


  }
  async califica(calificacion:string){
    this.respuestas[this.contador].boot.quieroCalificar = false;
    const response = await this.sendMsgServ.mandarCalificacion(calificacion);
    this.respuestas.push(response);
    /* Reproducimos el audio */
    this.contador = this.respuestas.length-1
    this.audioOpt.playByteArray(response.boot.voz.data);
    this.mostrarInputs = true;
  }
  Revision(){
    console.log('Quiero revisar');
  }
  async CalificarSi(){
    console.log('Quiero Calificar');
    this.preguntaCalificar = false;
    /* Realizamos acción para generar intent de quiero calificar */
    await this.sendMsgServ.quieroCalificar();

    this.respuestaCalificar = true;


    /* Desplegamos botones para calificar */




  }
  async CalificarNo(){
    console.log('No Quiero calificar');
    this.contador = this.respuestas.length-1;
    /*Escondemos el mensaje de calificar */
    this.respuestas[this.contador].boot.quieroCalificar = false
    /* No quiero calificar */
    const response = await this.sendMsgServ.noCalificar();
    /* Mostramos la respuesta */

    this.respuestas.push(response);
    this.contador = this.respuestas.length-1

    /* Reproducimos audio */

    this.audioOpt.playByteArray(response.boot.voz.data);

    /* Hacemos scroll */

    this.scrollAlUltimoMensaje();

    /* habilitamos el input*/

    this.mostrarInputs=true;
    
  }
  contarTiempo(){
    this.segundos++
    console.log(this.segundos);
  }

  async enviarMensajeMasPreguntas(){
    this.contador = this.respuestas.length -1;
    this.respuestas[this.contador].boot.MasPreguntas = false;
    const response = await this.sendMsgServ.SendMoreQuestions();
    console.log(response);
    /* En este caso no mostramos la respuesta en la pagina de mensajes */
    /* Solo mostramos respuesta del bot */
    this.respuestas.push(response);
    this.audioOpt.playByteArray(response.boot.voz.data);
    this.scrollAlUltimoMensaje();
    // Actualizamos El valor del database ...
    db.collection('respuestas').set(this.respuestas);

    


  }


  async limpiarChat(){
    
  }

  obtenerElemento($event){
    console.log($event);
    console.log(typeof($event))
    this.scrollInput = $event;
  }

  scrollToElement(){
    this.scrollInput.scrollIntoView();
  }

  openDialog(array:Array<String>){
    this.dialog.open(MoreinfoComponent);
    /* Necesito pasarle los valores del array, para esto creo un servicio */
    this.youtubeService.cambiarURLS(array);
  }

  async reproducirAudio ( audio, i ) {
    console.log(this.contadorMensajes);
    /* Detenemos los audios que se esten reproduciendo en el momento */
    if( this.audioOpt.contadorReproduccionesAudio > 0 ) this.audioOpt.stop();
    
    console.log(i);
    /* Quitamos todos los reproductores que esten actualmente en uso */

    for(let respuesta of this.respuestas){

      respuesta.boot.reproducir = false;

    }
    await this.audioOpt.playByteArray( audio )
    this.respuestas[i].boot.reproducir = true;
    
    
    this.contadorMensajes++
    console.log(this.audioOpt.duracionAudio);
    
      /* Creamos un evento que se reproduzca cuando el audio termine */
      setTimeout( () => {
        this.respuestas[i].boot.reproducir = false;
      },this.audioOpt.duracionAudio*1000);

      console.log(this.getAudioDuration( audio, 1, 1.4, 1));
      console.log(this.respuestas[i].boot);
    
    

  }

  getAudioDuration(arrayBuffer, numChannels, sampleRate, isFloatingPoint) {
    // PCM 16 or Float32
    const bytesPerSample = (isFloatingPoint ? Float32Array : Uint16Array).BYTES_PER_ELEMENT
    
    console.log(bytesPerSample);
    // total samples/frames
    const totalSamples = arrayBuffer.length / bytesPerSample / numChannels 
    console.log(totalSamples);
    // total seconds
    return totalSamples / sampleRate
  }

  detenerAudio ( index ) {
    this.audioOpt.stop();
    this.respuestas[ index ].boot.reproducir = false;
    this.contadorMensajes++;
  }  


}


