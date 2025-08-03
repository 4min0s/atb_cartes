import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.css'
})
export class TopBarComponent implements OnInit {
  @Input() nom: string = 'Agence';
  @Input() image: string = 'assets/notif.png';
  @Input() notificationCount: number = 0;

  @Input() type: number = 1;
  @Output() searchChange = new EventEmitter<string>();
  @Output() searchTypeChange = new EventEmitter<string>();
  @Output() bellClick = new EventEmitter<void>();
  id_agence: string | null = null;

  selectedType: string = 'nom';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.id_agence = localStorage.getItem('id_agence');
    }
    if (this.type !== 3 && this.id_agence) {
      setTimeout(() => {
        this.http.get<{ nom: string }>(`http://localhost:8000/get-agence-nom/${this.id_agence}`)
          .subscribe({
            next: (data) => {
              if (data && data.nom) {
                this.nom = data.nom;
              }
            },
            error: (err) => {
              this.nom = '';
            }
          });
      }, 100); // 300ms delay
    }
  }

  get bellWiggle(): boolean {
    return this.notificationCount > 0;
  }

  onSearchChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchChange.emit(value);
    console.log('Search value:', value);
  }

  onTypeChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedType = value;
    this.searchTypeChange.emit(value);
    console.log('Search type:', value);
  }

  onBellClick() {
    this.bellClick.emit();
  }
}
