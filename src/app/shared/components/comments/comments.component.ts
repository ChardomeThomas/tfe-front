import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Comment {
  id: number;
  author: string;
  content: string;
  date: Date;
}

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css']
})
export class CommentsComponent {
  @Input() photoId?: number;
  
  newComment = '';
  
  // Simulation de commentaires (à remplacer par un service plus tard)
  comments: Comment[] = [
    {
      id: 1,
      author: 'Jean Dupont',
      content: 'Magnifique photo ! J\'adore la lumière dans cette prise.',
      date: new Date('2025-08-05')
    },
    {
      id: 2,
      author: 'Marie Laurent',
      content: 'Quel endroit incroyable ! Merci pour le partage 📸',
      date: new Date('2025-08-06')
    },
    {
      id: 3,
      author: 'Pierre Durand',
      content: 'Les couleurs sont vraiment saisissantes ! 🌅',
      date: new Date('2025-08-04')
    }
  ];

  addComment() {
    if (this.newComment.trim()) {
      const newCommentObj: Comment = {
        id: Date.now(), // Simple ID generation
        author: 'Utilisateur', // À remplacer par l'utilisateur connecté
        content: this.newComment.trim(),
        date: new Date()
      };
      
      this.comments.unshift(newCommentObj); // Ajouter au début
      this.newComment = '';
    }
  }

  deleteComment(commentId: number) {
    this.comments = this.comments.filter(comment => comment.id !== commentId);
  }

  formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    return date.toLocaleDateString('fr-FR', options);
  }
}
