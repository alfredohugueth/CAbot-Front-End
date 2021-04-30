import { Component, OnInit } from '@angular/core';
import { YoutubeServiceService } from '../../../services/youtube-service.service';


@Component({
  selector: 'app-youtube-player',
  templateUrl: './youtube-player.component.html',
  styleUrls: ['./youtube-player.component.css']
})
export class YoutubePlayerComponent implements OnInit {
  url:String;
  id:String;
  constructor(public youtubeService:YoutubeServiceService) { }

  ngOnInit(): void {
    /* Realizamos la obtención del id */    
    this.id = this.youtubeService.urlID;
    console.log(this.id);
    /* Enviamos el id correspondiente al html*/
    
  }

}
