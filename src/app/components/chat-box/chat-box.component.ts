import { Component, OnInit } from '@angular/core';
import { SendMsgsService } from '../../services/send-msgs.service'

@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.css']
})
export class ChatBoxComponent implements OnInit {

  arrMensajesBot: any[];
  arrMensajesUsuario: string[];

  constructor(private sendMsgServ: SendMsgsService) { 
    this.arrMensajesBot = [];
  }

  ngOnInit(): void {
    this.sendMsgServ.recieveMsg()
      .then(msgs => this.arrMensajesBot.push(msgs))
      .catch(error => console.log(error));
  }

  enviarMensajes(){
    
  }

}
