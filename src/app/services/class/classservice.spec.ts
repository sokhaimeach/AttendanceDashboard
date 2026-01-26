import { TestBed } from '@angular/core/testing';

import { Classservice } from './classservice';

describe('Classservice', () => {
  let service: Classservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Classservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
