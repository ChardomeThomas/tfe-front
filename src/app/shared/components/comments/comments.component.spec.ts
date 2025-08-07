import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentsComponent } from './comments.component';

describe('CommentsComponent', () => {
  let component: CommentsComponent;
  let fixture: ComponentFixture<CommentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add a new comment', () => {
    component.newComment = 'Test comment';
    const initialLength = component.comments.length;
    
    component.addComment();
    
    expect(component.comments.length).toBe(initialLength + 1);
    expect(component.comments[0].content).toBe('Test comment');
    expect(component.newComment).toBe('');
  });

  it('should delete a comment', () => {
    const initialLength = component.comments.length;
    const commentToDelete = component.comments[0];
    
    component.deleteComment(commentToDelete.id);
    
    expect(component.comments.length).toBe(initialLength - 1);
    expect(component.comments.find(c => c.id === commentToDelete.id)).toBeUndefined();
  });

  it('should format date correctly', () => {
    const testDate = new Date('2025-08-05');
    const formattedDate = component.formatDate(testDate);
    
    expect(formattedDate).toBe('5 août 2025');
  });
});
