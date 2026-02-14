import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextLoading } from './text-loading';

describe('TextLoading', () => {
  let component: TextLoading;
  let fixture: ComponentFixture<TextLoading>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextLoading]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TextLoading);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
