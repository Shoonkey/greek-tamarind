import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HideoutList } from './hideout-list';

describe('HideoutList', () => {
  let component: HideoutList;
  let fixture: ComponentFixture<HideoutList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HideoutList],
      providers: [provideZonelessChangeDetection()],
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
});
