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
  selector: 'app-modifier-carte',
  standalone: true,
  imports: [ButtonComponent, InputComponent, TopBarComponent, CommonModule, FormsModule, HttpClientModule, MessageComponent,SuggestionComponent],
  templateUrl: './modifier-carte.component.html',
  styleUrl: './modifier-carte.component.css'
})
export class ModifierCarteComponent {


  id_agence: string | null = null;
  showSuggestion = false;
  public card: any = {
    nom: '',
    prenom: '',
    cin: '',
    type: '',
    numCarte: '',
    dateValidite: '',
    existe: '',
    emplacement: '',
    date_ajout: '',
    numero_compte: '',
    date_naissance: '',
    contact: '',
    new_cin: '',
    new_emplacement: '',
  };
  public old_num_carte: string = '';
  public successMessage: string = '';
  public emplacementWarning: string = '';
  public emplacementValid: boolean = true;

  constructor(private router: Router, private http: HttpClient) {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.id_agence = localStorage.getItem('id_agence');
    }
    const nav = this.router.getCurrentNavigation();
    this.card = nav?.extras?.state?.['card'] || {};
    this.card.new_cin = this.card.cin;
    if (!this.card.new_emplacement) {
      this.card.new_emplacement = this.card.emplacement || '';
    }
    if (!this.old_num_carte) {
      this.old_num_carte = this.card.numCarte || '';
    }
    console.log(this.card);
  }

  onEmplacementBlur() {
    this.showSuggestion = false;
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
    formData.append("new_cin", this.card.new_cin); // Use the current value of new_cin from the input field
    formData.append("type", this.card.type);
    formData.append("numCarte", this.card.numCarte);
    formData.append("dateValidite", this.card.dateValidite);
    formData.append("existe", this.card.existe);
    formData.append("new_emplacement", this.card.new_emplacement);
    formData.append("date_ajout", this.card.date_ajout || '');
    formData.append("numero_compte", this.card.numero_compte);
    formData.append("date_naissance", this.card.date_naissance);
    formData.append("contact", this.card.contact);

    this.http.put(`http://localhost:8000/update-carte-form/${this.card.cin}/${this.card.emplacement}/${this.id_agence}/${this.old_num_carte}`, formData)
      .subscribe({
        next: (res) => {
          this.successMessage = 'Modification effectuée avec succès ✅';
        },
        error: (err) => {
          this.successMessage = 'Erreur lors de la mise à jour ❌';
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
