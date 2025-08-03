import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, input } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mini-carte',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mini-carte.component.html',
  styleUrl: './mini-carte.component.css',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('{{fadeInDuration}}ms cubic-bezier(0.23, 1, 0.32, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ], { params: { fadeInDuration: 1500 } })
    ])
  ]
})
export class MiniCarteComponent {
  get formattedNumCarte(): string {
    if (!this.numCarte) return '';
    return this.numCarte.replace(/(.{4})/g, '$1 ').trim();
  }
  @Input() fadeInDuration: number = 1500;
  constructor(private router: Router) {}
  @Input() nom: string = '';
  @Input() prenom: string = '';
  @Input() cin: string = '';
  @Input() type: string = '';
  @Input() numCarte: string = '';
  @Input() dateValidite: string = '';
  @Input() date_ajout: string = '';
  @Input() existe: string = '';
  @Input() emplacement: string = '';
  @Input() valable: string = '';
  @Input() jour: number = 0;
  @Input() numcompte: string = '';
  @Input() date_naissance: string = '';
  @Input() contact: string = '';


  @Output() carteSelected = new EventEmitter<any>();

  onCarteClick() {
    const attributes = {
      nom: this.nom,
      prenom: this.prenom,
      cin: this.cin,
      type: this.type,
      numCarte: this.numCarte,
      dateValidite: this.dateValidite,
      existe: this.existe,
      emplacement: this.emplacement,
      valable: this.valable,
      jour : this.jour,
      date_ajout: this.date_ajout,
      numero_compte: this.numcompte,
      date_naissance: this.date_naissance,
      contact: this.contact,
   
    };
    this.carteSelected.emit(attributes);
  }
}


