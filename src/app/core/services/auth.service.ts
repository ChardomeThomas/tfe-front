// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
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

  constructor(private http: HttpClient, private router: Router) { }

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
  logout(redirectTo: string = '/'): void {
    localStorage.removeItem('isConnected');
    localStorage.removeItem('token');
    
    // Rediriger vers l'URL spécifiée (par défaut la page d'accueil)
    this.router.navigate([redirectTo]);
  }

  // Vérifie si l'utilisateur est connecté
  isLoggedIn(): boolean {
    return localStorage.getItem('isConnected') === 'true';
  }

  // Récupère le token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Décode le token JWT et retourne le payload
  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      const decodedPayload = atob(payload);
      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error('Erreur lors du décodage du token:', error);
      return null;
    }
  }

  // Récupère le rôle depuis le token
  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;

    const payload = this.decodeToken(token);
    return payload?.role || null;
  }

  // Récupère l'ID utilisateur depuis le token
  getUserId(): number | null {
    const token = this.getToken();
    if (!token) return null;

    const payload = this.decodeToken(token);
    return payload?.id || payload?.userId || null;
  }

  // Récupère les infos utilisateur depuis le token
  getUserInfo(): any {
    const token = this.getToken();
    if (!token) return null;

    return this.decodeToken(token);
  }

  // Récupère l'email depuis le token
  getUserEmail(): string | null {
    const token = this.getToken();
    if (!token) return null;

    const payload = this.decodeToken(token);
    return payload?.sub || payload?.email || null;
  }
}