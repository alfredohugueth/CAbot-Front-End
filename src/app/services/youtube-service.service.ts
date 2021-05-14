import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class YoutubeServiceService {

  /* Creamos la variable con la que llamaremos a las urls*/
  arrayUrls:Array<String>;
  urlID:String;
  

  constructor() { 

  }
  /* Creamos método que llamara las urls al cambiar */
  cambiarURLS(Urls:Array<String>){
    this.arrayUrls = Urls;
    console.log(this.arrayUrls);
  }

  obtenerUrlID(url:String){
    this.urlID=url;
    console.log(this.urlID);
  }

}
