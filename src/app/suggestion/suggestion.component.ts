import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgIf } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';


@Component({
  selector: 'app-suggestion',
  standalone: true,
  imports: [NgIf, HttpClientModule],
  templateUrl: './suggestion.component.html',
  styleUrl: './suggestion.component.css'
})
export class SuggestionComponent implements OnInit {
  suggestions: any[] = [];
  currentSuggestion: any = null;
  currentIndex: number = 0;
  show: boolean = true;
  id_agence=localStorage.getItem('id_agence')

  @Output() suggestionSelected = new EventEmitter<any>();

  constructor(private http: HttpClient) {}

  ngOnInit() {
    setTimeout(() => this.show = true, 0); // ensure fade-in
    this.fetchSuggestions();
  }

  fetchSuggestions() {
    this.http.get<any[]>(`http://localhost:8000/get_suggestions/${this.id_agence}`).subscribe({
      next: (res) => {
        this.suggestions = res || [];
        this.currentIndex = 0;
        this.setFirstSuggestion();
      },
      error: (err) => {
        this.suggestions = [];
        this.currentSuggestion = null;
      }
    });
  }

  setFirstSuggestion() {
    if (this.suggestions.length > 0) {
      this.currentSuggestion = this.suggestions[0];
      this.currentIndex = 0;
    } else {
      this.currentSuggestion = null;
      this.currentIndex = 0;
    }
  }

  onSuggestionClick() {
    if (this.suggestions.length === 0) {
      this.currentSuggestion = null;
      return;
    }
    this.currentIndex = (this.currentIndex + 1) % this.suggestions.length;
    this.currentSuggestion = this.suggestions[this.currentIndex];
  }
  update(){
    if (this.currentSuggestion) {
      this.suggestionSelected.emit(this.currentSuggestion);
      console.log('Suggestion selected:', this.currentSuggestion);
    }
  }
  closeSuggestion() {
    this.show = false;
  }
}
