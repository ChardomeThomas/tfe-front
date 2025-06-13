import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  // Connecte l'utilisateur (enregistre dans localStorage)
  login(): void {
    localStorage.setItem('isConnected', 'true');
  }

  // Déconnecte l'utilisateur (enlève la donnée de localStorage)
  logout(): void {
    localStorage.removeItem('isConnected');
  }

  // Vérifie si l'utilisateur est connecté
  isLoggedIn(): boolean {
    return localStorage.getItem('isConnected') === 'true';
  }
}
