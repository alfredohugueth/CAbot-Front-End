import { Component } from '@angular/core';
import { SendMsgsService } from './services/send-msgs.service'
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'CAbot-front-end';
  userID: string;

  constructor(sendMsService: SendMsgsService){

    sendMsService.generateID();

  }
  
}
