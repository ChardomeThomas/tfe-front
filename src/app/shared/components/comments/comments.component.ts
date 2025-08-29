import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommentService } from '../../../core/services/comment.service';
import { AuthService } from '../../../core/services/auth.service';
import { Comment } from '../../../interfaces/comment.interface';
import { UserService } from '../../../core/services/admin/userService.service';

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements OnInit, OnChanges {
  @Input() photoId?: number;
  
  newComment = '';
  comments: Comment[] = [];
  isLoading = false;
  isAuthenticated = false;

  constructor(private commentService: CommentService, private authService: AuthService) {}

  ngOnInit() {
    this.isAuthenticated = this.authService.isLoggedIn(); 
    if (this.photoId) {
      this.loadComments();
      
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['photoId'] && this.photoId) {
      this.loadComments();
    }
  }

  loadComments() {

    if (!this.photoId) return;
    
    this.isLoading = true;
    this.commentService.getCommentsByPhoto(this.photoId).subscribe({
      next: (comments) => {
        // Filtrer les commentaires publiés et non supprimés
        this.comments = comments.filter(comment => 
          comment.published && !comment.deletedAt
          
        );
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des commentaires:', error);
        this.comments = [];
        this.isLoading = false;
      }
    });
  }

  addComment() {
    if (!this.newComment.trim() || !this.photoId || this.newComment.length > 500) return;
    
    this.commentService.addComment(this.photoId, this.newComment.trim()).subscribe({
      next: (comment) => {
        // Ajouter le nouveau commentaire au début de la liste
        this.comments.unshift(comment);
        this.newComment = '';
      },
      error: (error) => {
        console.error('Erreur lors de l\'ajout du commentaire:', error);
        // Vous pouvez ajouter une notification d'erreur ici
      }
    });
  }

  deleteComment(commentId: number) {
    // Cette méthode pourrait être implémentée plus tard si vous avez un endpoint de suppression
    this.comments = this.comments.filter(comment => comment.id !== commentId);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('fr-FR', options);
  }
}
