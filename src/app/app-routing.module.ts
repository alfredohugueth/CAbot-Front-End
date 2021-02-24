import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutUsComponent } from './components/about-us/about-us.component';
import { ChatBoxComponent } from './components/chat-box/chat-box.component';
import { PreguntasComponent } from './components/preguntas/preguntas.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  {path:'',pathMatch:'full',redirectTo:'home'},
  {path:'home', component:HomeComponent },
  {path:'about-us', component: AboutUsComponent},
  {path:'questions', component:PreguntasComponent},
  {path:'chat',component:ChatBoxComponent},
  {path: '**', redirectTo:'home'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
