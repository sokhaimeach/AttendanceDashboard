import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordAttendance } from './record-attendance';

describe('RecordAttendance', () => {
  let component: RecordAttendance;
  let fixture: ComponentFixture<RecordAttendance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordAttendance]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecordAttendance);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
