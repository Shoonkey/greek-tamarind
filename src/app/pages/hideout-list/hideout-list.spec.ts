import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HideoutList } from './hideout-list';
import { ApiClient } from '../../services/api-client/api-client';
import { provideHttpClient } from '@angular/common/http';

describe('HideoutList', () => {
  let component: HideoutList;
  let fixture: ComponentFixture<HideoutList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HideoutList],
      providers: [
        provideZonelessChangeDetection(),
        // TODO: remove once ApiClient is properly mocked
        provideHttpClient(),
        // TODO: mock api client and make sure the right calls are made
        // { provide: ApiClient, useValue: null },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HideoutList);
    component = fixture.componentInstance;

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // it('should render a list of hideouts', () => {});
  // it('should have pagination control', () => {});
  // it('should update with new hideouts on page change', () => {});

  // TODO: Use HttpClientTesting to do these,
  // describe('should retrieve from the API', () => {
  //   it('the hideout tags', () => {});
  //   it('the hideout maps', () => {});
  //   it('the first page of hideouts', () => {});
  //   it('the hideout total page count', () => {});
  // });
});
