import { Component } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { InputComponent } from '../input/input.component';
import { TopBarComponent } from '../top-bar/top-bar.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageComponent } from '../message/message.component';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { SuggestionComponent } from '../suggestion/suggestion.component';

@Component({
  selector: 'app-ajouter-carte',
  standalone: true,
  imports: [ButtonComponent, InputComponent, TopBarComponent, CommonModule, FormsModule, HttpClientModule, MessageComponent,SuggestionComponent],
  templateUrl: './ajouter-carte.component.html',
  styleUrl: './ajouter-carte.component.css'
})
export class AjouterCarteComponent {
  onEmplacementBlur() {
    this.showSuggestion = false;
  }
  showSuggestion = false;
  public card: any = {
    nom: '',
    prenom: '',
    new_cin: '',
    type: '',
    numCarte: '',
    dateValidite: '',
    existe: 'valable',
    new_emplacement: '',
    date_ajout: '',
    numero_compte: '',
    date_naissance: '',
    contact: ''
  };

  public cinSuggestions: any[] = [];
  public showCinSuggestions: boolean = false;

  public successMessage: string = '';
  public emplacementWarning: string = '';
  public emplacementValid: boolean = true;

  id_agence: string | null = null;

  constructor(private router: Router, private http: HttpClient) {
    // Card is initialized as empty, so all fields are empty at first
    if (typeof window !== 'undefined' && window.localStorage) {
      this.id_agence = localStorage.getItem('id_agence');
    }
  }

  onCinInputChange() {
    const value = this.card.new_cin?.trim();
    if (!value) {
      this.cinSuggestions = [];
      this.showCinSuggestions = false;
      return;
      
    }
    this.http.get<any[]>(`http://localhost:8000/get_client/${encodeURIComponent(value)}/${this.id_agence}`)
      .subscribe({
        next: (res) => {
          this.cinSuggestions = res;
          this.showCinSuggestions = res && res.length > 0;
        },
        error: (err) => {
          this.cinSuggestions = [];
          this.showCinSuggestions = false;
        }
      });
  }

  selectCinSuggestion(suggestion: any) {
    this.card.new_cin = suggestion.cin;
    this.card.nom = suggestion.nom;
    this.card.prenom = suggestion.prenom;
    this.card.numero_compte = suggestion.num_compte || '';
    this.card.date_naissance = suggestion.date_naissance || '';
    this.card.contact = suggestion.contact || '';
    this.showCinSuggestions = false;
  }

  onEmplacementChange() {
    const value = this.card.new_emplacement?.trim();
    if (!value) {
      this.emplacementWarning = '';
      this.emplacementValid = true;
      return;
    }
    // If emplacement is unchanged, always valid
    if (value === (this.card.emplacement?.trim() || '')) {
      this.emplacementWarning = '';
      this.emplacementValid = true;
      return;
    }
    this.http.get<boolean>(`http://localhost:8000/get_emplacements/${encodeURIComponent(value)}/${this.id_agence}`)
      .subscribe({
        next: (res) => {
          if (res) {
            this.emplacementWarning = '';
            this.emplacementValid = true;
          } else {
            this.emplacementWarning = "emplacement occupé ou n'existe pas";
            this.emplacementValid = false;
          }
        },
        error: (err) => {
          this.emplacementWarning = "Erreur lors de la vérification de l'emplacement";
          this.emplacementValid = false;
        }
      });
  }

  submit() {
    if (!this.emplacementValid) {
      this.successMessage = "Veuillez corriger l'emplacement avant de soumettre.";
      return;
    }
    const formData = new FormData();
    formData.append("nom", this.card.nom);
    formData.append("prenom", this.card.prenom);
    formData.append("new_cin", this.card.new_cin);
    // Hide suggestions on submit
    this.showCinSuggestions = false;
    formData.append("type", this.card.type);
    formData.append("numCarte", this.card.numCarte);
    formData.append("dateValidite", this.card.dateValidite);
    formData.append("existe", this.card.existe);
    formData.append("new_emplacement", this.card.new_emplacement);
    formData.append("date_ajout", this.card.date_ajout || '');
    formData.append("numero_compte", this.card.numero_compte);
    formData.append("date_naissance", this.card.date_naissance);
    formData.append("contact", this.card.contact);

    this.http.post(`http://localhost:8000/ajouter-carte-form/${this.id_agence}`, formData)
      .subscribe({
        next: (res) => {
          this.successMessage = 'Carte ajoutée avec succès ✅';

        },
        error: (err) => {
          this.successMessage = 'Erreur lors de l\'ajout ❌';
          console.error(err);
        }
      });
  }
    onSuggestionSelected(suggestion: any) {
  this.card.new_emplacement = suggestion.nom;
}

  onMessageOk() {
    this.router.navigateByUrl('/home', { state: { card: this.card }, replaceUrl: true });
  }
}
