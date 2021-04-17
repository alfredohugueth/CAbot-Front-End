import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'navegador-principal',
  templateUrl: './navegador.component.html',
  styleUrls: ['./navegador.component.css']
})
export class NavegadorComponent implements OnInit {
  mostrarMenu:Boolean;
  constructor() { 
    this.mostrarMenu = false;
  }

  ngOnInit(): void {
  }

  desplegarMenu(){
    console.log('Mostramos menu');
    this.mostrarMenu=!this.mostrarMenu;
    console.log(this.mostrarMenu);
  }

}
