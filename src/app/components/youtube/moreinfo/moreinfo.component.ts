import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { YoutubeServiceService } from '../../../services/youtube-service.service';
import { YoutubePlayerComponent } from '../youtube-player/youtube-player.component';

@Component({
  selector: 'app-moreinfo',
  templateUrl: './moreinfo.component.html',
  styleUrls: ['./moreinfo.component.css']
})
export class MoreinfoComponent implements OnInit {
  urls:Array<String>;

  constructor(
    private youtubeService:YoutubeServiceService,
    public dialog: MatDialog
    ) { 
    
  }

  ngOnInit(): void {
    this.urls = this.youtubeService.arrayUrls;
    console.log(this.urls);
  }

  openVideo(url:String){
    console.log(url);
    this.youtubeService.obtenerUrlID(url);
    this.dialog.open(YoutubePlayerComponent);

  }

}
