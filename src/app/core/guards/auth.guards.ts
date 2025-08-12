// src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Ajuste le chemin vers ton AuthService

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService, 
    private router: Router
  ) {}

  canActivate(): boolean {
    // Vérifier si l'utilisateur est connecté ET si le token est valide
    if (this.authService.isLoggedIn() && !this.authService.isTokenExpired()) {
      return true;
    }
    
    // Si pas connecté ou token expiré, rediriger vers login
    console.log('Accès refusé - Token expiré ou utilisateur non connecté');
    this.authService.logout('');
    return false;
  }
}