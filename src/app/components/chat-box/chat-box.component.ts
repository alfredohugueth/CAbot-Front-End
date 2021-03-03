import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { SendMsgsService } from '../../services/send-msgs.service';


@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.css']
})
export class ChatBoxComponent implements OnInit {

  formularioMensajes: FormGroup
  arrMensajesBot: any[];
  arrMensajesUsuario: string[];
  respuestas: any[];
  contador: number;
  userID:string;


  constructor(private sendMsgServ: SendMsgsService) { 
    this.arrMensajesBot = [];
    this.arrMensajesUsuario = [];
    this.respuestas = [];
    this.contador = 0;
    this.formularioMensajes = new FormGroup({
      estado: new FormControl(true),
      emisor: new FormControl('usuario'),
      texto: new FormControl(''),
      userid: new FormControl(this.userID)

    })
    this.userID = sendMsgServ.userID;
    console.log(this.userID);
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

  async enviarMensaje(){
    this.respuestas[this.contador].user.texto = this.formularioMensajes.value.texto;
    this.respuestas[this.contador].user.estado = this.formularioMensajes.value.estado;
    this.contador ++;
    //this.arrMensajesUsuario.push(this.formularioMensajes.value);

    try{
      const response = await this.sendMsgServ.sendMsg(this.formularioMensajes.value,this.userID);
      console.log(response);
      this.respuestas.push(response);
      this.playByteArray(response.boot.voz.data);
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

}
