import { Component } from '@angular/core';
import { map } from 'rxjs/operators';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { SendMsgsService } from '../../services/send-msgs.service'
import { Chart } from 'node_modules/chart.js';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-preguntas',
  templateUrl: './preguntas.component.html',
  styleUrls: ['./preguntas.component.css']
})
export class PreguntasComponent {
  /** Based on the screen size, switch from standard to one column per row */
  data:any;
  numeroPreguntasHechas:any;
  valoresDatosRepetidos:Number;
  otrasPreguntas:Number;
  nombresGraficas:any;
  dataGrafica:any

  constructor(public servicioCarga:LoaderService, private breakpointObserver: BreakpointObserver,private httpClient:SendMsgsService) {
    this.data = [];
    this.numeroPreguntasHechas = [];
    this.valoresDatosRepetidos = 0;
    this.nombresGraficas = [];
    this.dataGrafica = []
    
  }
  async ngOnInit(){
    /* Recibimos las respuestas mas comunes que se han hecho */
    this.data = await this.httpClient.recivePreguntasFrecuentes();
    console.log(this.data);
    /* Enviamos data para llenar el las cartas*/ 

    /* Recibimos el numero de preguntas realizadas por los usuarios en total para poder determinar el total pa las graficas */
    this.numeroPreguntasHechas = await this.httpClient.obtenerNumeroPreguntasRealizadas();
    console.log(this.numeroPreguntasHechas)
    let tempo = this.numeroPreguntasHechas.numeroPreguntasFundamentos;
    console.log(tempo);
    for(let dat of this.data){
      console.log(dat);
      tempo = tempo-dat.count;
      this.nombresGraficas.push(dat._id.Pregunta);
      this.dataGrafica.push(dat.count);
    }
    console.log(tempo);
    this.otrasPreguntas = tempo;
    this.nombresGraficas.push('Otras Preguntas');
    this.dataGrafica.push(tempo);
    

    /* Procedemos a realizar la grafica que se mostrara en la pagina web */


    var ctx = document.getElementById('Grafica');
    console.log(ctx);
    var myChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.nombresGraficas,
        datasets: [{
          label: '# De veces preguntadas',
          data: this.dataGrafica,
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          yAxes: [{
            label:"Fecha",
            ticks: {
              beginAtZero: true,
              
            
            }
          }]
        },
        
      }
    });
    
  }
}


