import { Component, OnInit } from '@angular/core';
import { TopBarComponent } from "../top-bar/top-bar.component";
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-caisse',
  standalone: true,
  imports: [TopBarComponent, HttpClientModule, CommonModule],
  templateUrl: './caisse.component.html',
  styleUrl: './caisse.component.css'
})
export class CaisseComponent implements OnInit {
  rows: string[] = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N'];
  columns: number[] = Array.from({length: 20}, (_, i) => i + 1);
  occupiedCells: {row: string, col: number}[] = [];
  id_agence: string | null = null;
  highlightEmplacement: string | null = null;
  highlightRow: string | null = null;
  highlightCol: number | null = null;

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['highlight']) {
        this.highlightEmplacement = params['highlight'];
        if (this.highlightEmplacement) {
          const match = this.highlightEmplacement.match(/^([A-N])(\d{1,2})$/);
          if (match) {
            this.highlightRow = match[1];
            this.highlightCol = Number(match[2]);
          }
        }
      }
    });
    if (typeof window !== 'undefined' && window.localStorage) {
      this.id_agence = localStorage.getItem('id_agence');
    }
    if (this.id_agence) {
      this.http.get<any[]>(`http://localhost:8000/get_occupe/${this.id_agence}`)
        .subscribe({
          next: (data) => {
            this.occupiedCells = data
              .map(item => {
                const match = item.nom.match(/^([A-N])(\d{1,2})$/);
                if (match) {
                  return {row: match[1], col: Number(match[2])};
                }
                return null;
              })
              .filter((cell): cell is {row: string, col: number} => cell !== null);
          },
          error: () => {
            this.occupiedCells = [];
          }
        });
    }
  }

  isOccupied(row: string, col: number): boolean {
    return this.occupiedCells.some(cell => cell.row === row && cell.col === col);
  }

  isHighlighted(row: string, col: number): boolean {
    return this.highlightRow === row && this.highlightCol === col;
  }
}
