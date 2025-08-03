import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsulterCarteComponent } from './consulter-carte.component';

describe('ConsulterCarteComponent', () => {
  let component: ConsulterCarteComponent;
  let fixture: ComponentFixture<ConsulterCarteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsulterCarteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConsulterCarteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
