// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

interface LoginResponse {
  token: string;
  user?: any; // Adaptez selon votre réponse API
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:48080/api/auth/login';

  constructor(private http: HttpClient) { }

  // Connecte l'utilisateur via l'API
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl, { email, password })
      .pipe(
        tap(response => {
          // Sauvegarder le token et l'état de connexion
          localStorage.setItem('token', response.token);
          localStorage.setItem('isConnected', 'true');
        })
      );
  }

  // Déconnecte l'utilisateur (enlève la donnée de localStorage)
  logout(): void {
    localStorage.removeItem('isConnected');
    localStorage.removeItem('token');
  }

  // Vérifie si l'utilisateur est connecté
  isLoggedIn(): boolean {
    return localStorage.getItem('isConnected') === 'true';
  }

  // Récupère le token
  getToken(): string | null {
    return localStorage.getItem('token');
  }
}