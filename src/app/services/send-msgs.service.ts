import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'

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

  sendMsg({estado,emisor,texto},userID): Promise<any>{
    const bodyRequest = { estado,emisor, texto, userID};


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
}
