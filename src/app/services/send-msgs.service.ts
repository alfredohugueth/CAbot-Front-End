import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'

@Injectable({
  providedIn: 'root'
})
export class SendMsgsService {
  baseUrl:string;

  constructor(private httpClient: HttpClient) { 
    this.baseUrl='http://localhost:3000'
  }

  recieveMsg(): Promise<any>{
    return this.httpClient.get(`${this.baseUrl}/botmsg`).toPromise();
    
  }
}
