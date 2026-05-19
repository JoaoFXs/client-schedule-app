import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionLocationComponent } from './permission-location.component';

describe('PermissionLocationComponent', () => {
  let component: PermissionLocationComponent;
  let fixture: ComponentFixture<PermissionLocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionLocationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermissionLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
