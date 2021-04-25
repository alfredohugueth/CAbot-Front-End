import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutUsComponent } from './components/about-us/about-us.component';
import { ChatBoxComponent } from './components/chat-box/chat-box.component';
import { PreguntasComponent } from './components/preguntas/preguntas.component';
import { HomeComponent } from './components/home/home.component';
import { NavegadorComponent } from './components/navegador/navegador.component';
import { InstruccionesComponent } from './components/instrucciones/instrucciones.component';
import { MoreInfoComponent } from './components/more-info/more-info.component';

const routes: Routes = [
  {path:'',pathMatch:'full',redirectTo:'home'},
  {path:'home', component:HomeComponent },
  {path:'about-us', component: AboutUsComponent},
  {path:'questions', component:PreguntasComponent},
  {path:'chat',component:ChatBoxComponent},
  {path:'instructions',component:InstruccionesComponent},
  {path:'more-info',component:MoreInfoComponent},
  {path: '**', redirectTo:'home'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
