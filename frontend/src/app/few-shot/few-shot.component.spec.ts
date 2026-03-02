import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FewShotComponent } from './few-shot.component';

describe('FewShotComponent', () => {
  let component: FewShotComponent;
  let fixture: ComponentFixture<FewShotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FewShotComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FewShotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
