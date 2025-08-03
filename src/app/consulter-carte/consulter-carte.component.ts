import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonComponent } from '../button/button.component';
import { TopBarComponent } from '../top-bar/top-bar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-consulter-carte',
  standalone: true,
  imports: [ButtonComponent, TopBarComponent, CommonModule,HttpClientModule],
  templateUrl: './consulter-carte.component.html',
  styleUrl: './consulter-carte.component.css'
})
export class ConsulterCarteComponent {
  get formattedNumCarte(): string {
    if (!this.card?.numCarte) return '';
    return this.card.numCarte.replace(/(.{4})/g, '$1 ').trim();
  }
  public card: any = {
    nom: '',
    prenom: '',
    cin: '',
    type: '',
    numCarte: '',
    dateValidite: '',
    existe: '',
    emplacement: '',
    valable: ''
  };
  id_agence: string | null = null;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.id_agence = localStorage.getItem('id_agence');
    }
    const nav = this.router.getCurrentNavigation();
    const stateCard = nav?.extras?.state?.['card'];
    if (stateCard) {
      this.card = { ...this.card, ...stateCard };
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('current_card', JSON.stringify(this.card));
      }
    } else {
      let storedCard: string | null = null;
      if (typeof window !== 'undefined' && window.localStorage) {
        storedCard = localStorage.getItem('current_card');
      }
      if (storedCard) {
        this.card = { ...this.card, ...JSON.parse(storedCard) };
      }
    }
    console.log(this.card);
  }

  onModifierClick(card: any) {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('current_card', JSON.stringify(card));
    }
    this.router.navigate(['/modifier'], { state: { card } });
  }
  viewEmplacement(emplacement: string) {
    this.router.navigate(['/caisier'], { queryParams: { highlight: emplacement } });
  }

  showDeleteDialog = false;

  onSupprimerClick() {
    this.showDeleteDialog = true;
  }

  deleteCarteOnly() {
    const numCarte = this.card?.numCarte;
    if (!numCarte) return;
    this.http.delete(`http://127.0.0.1:8000/delete_card/${numCarte}/${this.id_agence}`).subscribe({
      next: (res) => {
        console.log('Carte supprimée:', res);
        this.showDeleteDialog = false;
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Erreur lors de la suppression:', err);
        this.showDeleteDialog = false;
        alert('Erreur lors de la suppression');
      }
    });
  }

  deleteCarteAndClient() {
    const numCarte = this.card?.numCarte;
    if (!numCarte) return;
    this.http.delete(`http://127.0.0.1:8000/delete_card_client/${numCarte}/${this.id_agence}`).subscribe({
      next: (res) => {
        console.log('Carte et client supprimés:', res);
        this.showDeleteDialog = false;
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Erreur lors de la suppression:', err);
        this.showDeleteDialog = false;
        alert('Erreur lors de la suppression');
      }
    });
  }

  cancelDelete() {
    this.showDeleteDialog = false;
  }
}
