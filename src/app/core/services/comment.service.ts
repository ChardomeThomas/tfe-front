// comment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Comment } from '../../interfaces/comment.interface';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private readonly baseUrl = `${environment.apiUrl}/comments`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
      console.log('Token ajouté dans l\'header Authorization:', `Bearer ${token.substring(0, 50)}...`);
    } else {
      console.error('Aucun token trouvé dans localStorage !');
    }

    return headers;
  }

  private getUserIdFromToken(): number | string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Payload complet du token JWT:', payload); // Pour debug complet
      
      // Chercher l'ID utilisateur dans différents champs possibles
      const userId = payload.userId || payload.id || payload.user_id;
      const userEmail = payload.sub || payload.email;
      
      console.log('UserId trouvé:', userId);
      console.log('Email utilisateur:', userEmail);
      
      // Retourner l'ID numérique si disponible, sinon l'email
      return userId || userEmail;
    } catch (e) {
      console.error('Erreur lors du décodage du token:', e);
      return null;
    }
  }

  // Récupérer les commentaires d'une photo
  getCommentsByPhoto(photoId: number): Observable<Comment[]> {
    const url = `${environment.apiUrl}/comments/photo/${photoId}`;  // Ajouter le 's'
    return this.http.get<Comment[]>(url);
  }

  // Ajouter un commentaire à une photo
  addComment(photoId: number, content: string): Observable<Comment> {
    const url = `${environment.apiUrl}/comments`;
    
    // Le backend devrait extraire l'utilisateur du token JWT automatiquement
    const body = {
      photoId: photoId,
      content: content
    };
    
    console.log('Données envoyées (sans userId):', body);
    console.log('Token envoyé dans headers:', !!localStorage.getItem('token'));
    
    return this.http.post<Comment>(url, body, { headers: this.getHeaders() });
  }
}