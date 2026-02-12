import { TestBed } from '@angular/core/testing';

import { Attendanceservice } from './attendanceservice';

describe('Attendanceservice', () => {
  let service: Attendanceservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Attendanceservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
