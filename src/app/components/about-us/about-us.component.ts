import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.css']
})
export class AboutUsComponent implements OnInit {
  imagenes:object;
  constructor() { 
    this.imagenes = ['../../assets/imagenes/FondoAlfredo.jpg','../../assets/imagenes/FondoLuis.jpg'];
  }

  ngOnInit(): void {
  }

}
