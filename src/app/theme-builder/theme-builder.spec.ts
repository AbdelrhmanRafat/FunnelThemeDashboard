import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThemeBuilder } from './theme-builder';

describe('ThemeBuilder', () => {
  let component: ThemeBuilder;
  let fixture: ComponentFixture<ThemeBuilder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThemeBuilder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThemeBuilder);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
