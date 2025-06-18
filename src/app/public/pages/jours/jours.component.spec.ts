import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoursComponent } from './jours.component';

describe('JoursComponent', () => {
  let component: JoursComponent;
  let fixture: ComponentFixture<JoursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoursComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
