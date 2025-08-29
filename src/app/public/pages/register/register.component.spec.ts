import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate password match', () => {
    component.registerForm.patchValue({
      password: 'password123',
      confirmPassword: 'different123'
    });
    
    expect(component.registerForm.errors?.['passwordMismatch']).toBeTruthy();
  });

  it('should validate required fields', () => {
    component.registerForm.patchValue({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });

    expect(component.username?.errors?.['required']).toBeTruthy();
    expect(component.email?.errors?.['required']).toBeTruthy();
    expect(component.password?.errors?.['required']).toBeTruthy();
    expect(component.confirmPassword?.errors?.['required']).toBeTruthy();
  });

  it('should validate email format', () => {
    component.registerForm.patchValue({
      email: 'invalid-email'
    });

    expect(component.email?.errors?.['email']).toBeTruthy();
  });

  it('should validate minimum username length', () => {
    component.registerForm.patchValue({
      username: 'ab'
    });

    expect(component.username?.errors?.['minlength']).toBeTruthy();
  });

  it('should validate minimum password length', () => {
    component.registerForm.patchValue({
      password: '123'
    });

    expect(component.password?.errors?.['minlength']).toBeTruthy();
  });
});
