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
    this.url = this.youtubeService.urlID;
    console.log(this.url);
    /* Realizamos la obtención del id */
    let temporal = this.url.split("=");
    this.id = temporal[1];
    console.log(this.id);
    /* Enviamos el id correspondiente al html*/
    
  }

}
