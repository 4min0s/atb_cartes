import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiniCarteComponent } from './mini-carte.component';

describe('MiniCarteComponent', () => {
  let component: MiniCarteComponent;
  let fixture: ComponentFixture<MiniCarteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiniCarteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MiniCarteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
