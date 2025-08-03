import { Component } from '@angular/core';
import { TopBarComponent } from '../top-bar/top-bar.component';
import { MiniCarteComponent } from '../mini-carte/mini-carte.component';
import { ButtonComponent } from '../button/button.component';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-cartes',
  standalone: true,
  imports: [TopBarComponent, MiniCarteComponent, ButtonComponent, HttpClientModule, NgFor,NgIf],
  templateUrl: './cartes.component.html',
  styleUrl: './cartes.component.css'
})
export class CartesComponent {
  APIURL= "http://127.0.0.1:8000/";
  card: any = [];
  allCards: any = [];
  showNotification = false;
  notificationCount = 0;
  chaine: string = '';
  searchType: string = 'nom';
  id_agence: string | null = null;


  

  ngOnInit(){
    if (typeof window !== 'undefined' && window.localStorage) {
      this.id_agence = localStorage.getItem('id_agence');
    }
    this.getcartes();
  }

  constructor(private router: Router , private http: HttpClient) {}

  onCarteClick(card: any) {
    this.router.navigate(['/consulter-carte'], { state: { card } });
  }

  getcartes() {
    if (!this.id_agence) {
      return;
    }
    this.http.get(this.APIURL + `get-cartes/${this.id_agence}`).subscribe((result: any) => {
      this.card = result;
      this.allCards = result;
      const expiringCards = this.allCards.filter((c: any) => c.jour > 20 && c.existe === 'valable');
      this.notificationCount = expiringCards.length;
      console.log(this.card);
      console.log(this.chaine);
      console.log(this.id_agence);
    });
  }



  onSearch(searchValue: string) {
    if (!searchValue) {
      this.card = this.allCards;
    } else {
      if (this.searchType === 'nom') {
        this.card = this.allCards.filter((c: any) =>
          (c.nom + ' ' + c.prenom).toLowerCase().includes(searchValue.toLowerCase())
        );
      } else if (this.searchType === 'carte') {
        this.card = this.allCards.filter((c: any) =>
          c.numCarte && c.numCarte.toLowerCase().includes(searchValue.toLowerCase())
        );
      }
    }
  }

  onSearchTypeChange(type: string) {
    this.searchType = type;
  }

  onBellClick() {
    
    if (this.notificationCount > 0) {
      this.showNotification = true;
    } else {
      this.showNotification = false;
    }
  }

  closeNotification() {
    this.showNotification = false;
  }

  viewEmplacement(emplacement: string) {
    this.router.navigate(['/caisier'], { queryParams: { highlight: emplacement } });
  }
}
