import { Component } from '@angular/core';
import { TopBarComponent } from "../top-bar/top-bar.component";
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [TopBarComponent,HttpClientModule,CommonModule,FormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';

  constructor(private http: HttpClient, private router: Router) {}

  login() {
    const formData = new FormData();
    formData.append('username', this.username);
    formData.append('password', this.password);

    this.http.post<any>('http://localhost:8000/login', formData).subscribe({
      next: (res) => {
        localStorage.setItem('id_agence', res.id_agence);
        this.router.navigate(['/home']);
      },
      error: () => {
        this.error = 'Identifiant ou mot de passe incorrect';
      }
    });
  }
}
