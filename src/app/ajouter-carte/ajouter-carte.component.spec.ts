import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjouterCarteComponent } from './ajouter-carte.component';

describe('AjouterCarteComponent', () => {
  let component: AjouterCarteComponent;
  let fixture: ComponentFixture<AjouterCarteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AjouterCarteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AjouterCarteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
