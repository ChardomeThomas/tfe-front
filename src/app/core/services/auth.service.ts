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

  // Vérifie si l'utilisateur est connecté ET si le token est valide
  isLoggedIn(): boolean {
    const isConnected = localStorage.getItem('isConnected') === 'true';
    const token = this.getToken();
    
    // Si pas de token ou pas marqué comme connecté, retourner false
    if (!isConnected || !token) {
      return false;
    }
    
    // Vérifier si le token est expiré
    const hasValidToken = !this.isTokenExpired();
    
    // Si le token est expiré, on retourne false sans nettoyer ici
    // Le nettoyage sera fait par l'interceptor lors d'une vraie requête 401
    return hasValidToken;
  }

  // NOUVELLE MÉTHODE : Vérifie si le token est expiré
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = this.decodeToken(token);
      if (!payload || !payload.exp) return true;
      
      // Convertir le timestamp en secondes et comparer avec le temps actuel
      const currentTime = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp < currentTime;
      
      if (isExpired) {
        console.log('Token expiré à:', new Date(payload.exp * 1000));
      }
      
      return isExpired;
    } catch (error) {
      console.error('Erreur lors de la vérification d\'expiration du token:', error);
      return true;
    }
  }

  // NOUVELLE MÉTHODE : Force la vérification du token et déconnecte si nécessaire
  checkTokenValidity(): boolean {
    if (this.isTokenExpired()) {
      console.log('Token expiré, nettoyage des données...');
      // Nettoyer sans rediriger
      localStorage.removeItem('isConnected');
      localStorage.removeItem('token');
      return false;
    }
    return true;
  }

  // NOUVELLE MÉTHODE : Nettoyage silencieux du localStorage
  private cleanExpiredSession(): void {
    localStorage.removeItem('isConnected');
    localStorage.removeItem('token');
  }

  // NOUVELLE MÉTHODE : Obtient le temps restant avant expiration (en minutes)
  getTokenTimeRemaining(): number {
    const token = this.getToken();
    if (!token) return 0;

    try {
      const payload = this.decodeToken(token);
      if (!payload || !payload.exp) return 0;
      
      const currentTime = Math.floor(Date.now() / 1000);
      const timeRemaining = payload.exp - currentTime;
      
      return Math.max(0, Math.floor(timeRemaining / 60)); // Retour en minutes
    } catch (error) {
      return 0;
    }
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
    if (this.isTokenExpired()) return null;
    
    const token = this.getToken();
    if (!token) return null;

    const payload = this.decodeToken(token);
    return payload?.role || null;
  }

  // Récupère l'ID utilisateur depuis le token
  getUserId(): number | null {
    if (this.isTokenExpired()) return null;
    
    const token = this.getToken();
    if (!token) return null;

    const payload = this.decodeToken(token);
    return payload?.id || payload?.userId || null;
  }

  // Récupère les infos utilisateur depuis le token
  getUserInfo(): any {
    if (this.isTokenExpired()) return null;
    
    const token = this.getToken();
    if (!token) return null;

    return this.decodeToken(token);
  }

  // Récupère l'email depuis le token
  getUserEmail(): string | null {
    if (this.isTokenExpired()) return null;
    
    const token = this.getToken();
    if (!token) return null;

    const payload = this.decodeToken(token);
    return payload?.sub || payload?.email || null;
  }
}