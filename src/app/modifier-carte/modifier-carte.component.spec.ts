import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifierCarteComponent } from './modifier-carte.component';

describe('ModifierCarteComponent', () => {
  let component: ModifierCarteComponent;
  let fixture: ComponentFixture<ModifierCarteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModifierCarteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModifierCarteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
