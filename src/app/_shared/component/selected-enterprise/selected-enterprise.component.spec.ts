import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedEnterpriseComponent } from './selected-enterprise.component';

describe('SelectedEnterpriseComponent', () => {
  let component: SelectedEnterpriseComponent;
  let fixture: ComponentFixture<SelectedEnterpriseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectedEnterpriseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectedEnterpriseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
