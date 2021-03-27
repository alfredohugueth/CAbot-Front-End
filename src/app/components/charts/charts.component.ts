import { Component, OnInit, ViewChild } from '@angular/core';
import { Chart } from 'node_modules/chart.js';
import { SendMsgsService } from '../../services/send-msgs.service';
import { LoaderService } from '../../services/loader.service';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css']
})
export class ChartsComponent implements OnInit {
  @ViewChild(CdkVirtualScrollViewport)
  viewport: CdkVirtualScrollViewport;
  mostrarRespuesta:boolean;
  data:object;
  dataGrafica:object;
  nombresGraficas:object;
  // Obtenemos los datos de las preguntas mas buscadas en nuestra base de datos:
  constructor(public servicioCarga:LoaderService, private sendMsgServ:SendMsgsService) { 
    this.mostrarRespuesta=false;
    this.data = [];
    this.dataGrafica=[];
    this.nombresGraficas=[];

    
  }

  
  
  async ngOnInit(){
    console.log(this.sendMsgServ.baseUrl);
    

    // LLamamos a los datos de la base de datos.
    this.data = await this.sendMsgServ.recivePreguntasFrecuentes();
    console.log(this.data);
    this.data = await this.llenarVectorConFalsos(this.data);

    console.log(this.data);
    
    this.dataGrafica = await this.llenarVectorDatos(this.data);
    this.nombresGraficas = await this.llenarVectorLabels(this.data);


    // Creamos las graficas que observara el usuario ..
    // Guadramos el vector que tomaremos como label y el otro que tomaremos como data....
    // en _id.pregunta esta la pregunta que se pondra como label y en count esta el contador que usaremos como data...

    var ctx = document.getElementById('Grafica');
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
        }
      }
    });
  }

  trackByIdx(index: number, obj: any): any {
    return index;
  }

  llenarVectorConFalsos(data){
    
    console.log(data.length);
    for(let i=0;i<data.length;i++){
      data[i].mostrar=false;
      
    }

    

    return data


  }

  


  // Definimos la funcion on click al elemento...
  desplegar(index){
    
    this.data[index].mostrar=!this.data[index].mostrar;
    
    
    
  }

  llenarVectorDatos(data){
    let contador=0;
    let datag=[];
    let i=0;
    for(let dat of data){
      if(i>=5){
        contador=contador+dat.count;
        if(i==data.length-1){
          datag[5]=contador;
        }
      }else{
        datag[i]=dat.count;
      }
      i++
    }
    console.log(datag);
    return datag


  }

  llenarVectorLabels(data){
    let datag=[];
    let i=0;
    for(let dat of data){
      if(i>=5){
        console.log(i==data.length);
        if(i==data.length-1){
          console.log('entramos en condicional de labels');
          datag[5]='Otras preguntas';
        }
      }else{
      datag[i]=dat._id.Pregunta;
      }
      i++
    }
    
    return datag
  }

}
