import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductFeature } from './product-feature';

describe('ProductFeature', () => {
  let component: ProductFeature;
  let fixture: ComponentFixture<ProductFeature>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFeature]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductFeature);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
