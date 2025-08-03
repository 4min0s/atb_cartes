import { Routes } from '@angular/router';
import { TopBarComponent } from './top-bar/top-bar.component';
import { CartesComponent } from './cartes/cartes.component';
import { ConsulterCarteComponent } from './consulter-carte/consulter-carte.component';
import { AjouterCarteComponent } from './ajouter-carte/ajouter-carte.component';
import { ModifierCarteComponent } from './modifier-carte/modifier-carte.component';
import { SuggestionComponent } from './suggestion/suggestion.component';
import { LoginComponent } from './login/login.component';
import { CaisseComponent } from './caisse/caisse.component';

export const routes: Routes = [
    {path:'',component:LoginComponent},
    {path:'home',component:CartesComponent},
    {path:'consulter-carte', component: ConsulterCarteComponent},
    {path:'ajouter', component:AjouterCarteComponent},
    {path:'modifier', component: ModifierCarteComponent},
    {path:'caisier', component: CaisseComponent},


];
