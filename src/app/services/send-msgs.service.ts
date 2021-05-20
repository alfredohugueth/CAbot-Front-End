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
    this.baseUrl='https://cabot-back-end.herokuapp.com'

    //this.baseUrl = 'http://localhost:3000'
  }

  recieveMsg(): Promise<any>{
     let id = this.userID
    return this.httpClient.post(`${this.baseUrl}/botmsg`,{id:id}).toPromise();
    
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

  SendMoreQuestions(): Promise<any>{
    let bodyRequest = {
      text : 'Otra pregunta',
      userID: this.userID
    }
    return this.httpClient.post(`${this.baseUrl}/botmsg/more_questions`,bodyRequest).toPromise();
  }


  quieroCalificar():Promise<any>{
    let bodyRequest = {
      text:'el usuario quiere calificar',
      userID:this.userID
    }

    return this.httpClient.post(`${this.baseUrl}/botmsg/gradebot`,bodyRequest).toPromise();
  }

  mandarCalificacion(calificacion:string):Promise<any>{
    let bodyRequest ={
      text: calificacion,
      userID: this.userID
    }

    return this.httpClient.post(`${this.baseUrl}/botmsg/califica`,bodyRequest).toPromise();


  }

  noCalificar():Promise<any>{
    let bodyRequest ={
      text: 'El usuario no va a calificar nada',
      userID: this.userID
    }

    return this.httpClient.post(`${this.baseUrl}/botmsg/nocalifica`,bodyRequest).toPromise();
  }


  obtenerNumeroPreguntasRealizadas():Promise<any>{
    return this.httpClient.get(`${this.baseUrl}/botmsg/numero-preguntas`).toPromise();
  }
}
