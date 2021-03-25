import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class SendMsgsService {
  baseUrl:string;
  userID: string;

  constructor(private httpClient: HttpClient) { 
    this.baseUrl='http://localhost:3000'
  }

  recieveMsg(): Promise<any>{
     
    return this.httpClient.get(`${this.baseUrl}/botmsg`).toPromise();
    
  }

  sendMsg(bodyRequest): Promise<any>{
    
    return this.httpClient.post<any>(`${this.baseUrl}/botmsg/usuario`,bodyRequest).toPromise();
  }

  generateID(){
    let s4 = () =>{
      return Math.floor((1 + Math.random())*0x10000)
        .toString(16)
        .substring(1);
    }
    this.userID =  s4() + s4()
  }
  audioFormat(audio:any,){
    const formData = new FormData();
    formData.append('pregunta',audio,'audio.wav');
    console.log(formData.get('pregunta'));
    const bodyRequest = {audio};
    console.log(bodyRequest);
    return formData.get('pregunta') 

    //return this.httpClient.post<any>(`${this.baseUrl}/botmsg/audio`,formData.get('pregunta')).toPromise();
  }

  async sendAudio(formAudio:any): Promise<any>{
    let bodyRequest = {formAudio}
    return this.httpClient.post<any>(`${this.baseUrl}/botmsg/audio`,formAudio).toPromise();
  }

  recivePreguntasFrecuentes(): Promise<any>{
    return this.httpClient.get(`${this.baseUrl}/botmsg/preguntas-comunes`).toPromise();
  }
}
