import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef, provideZonelessChangeDetection } from '@angular/core';

import { HideoutListFilters } from './hideout-list-filters';

describe('HideoutListFilters', () => {
  let component: HideoutListFilters;
  let componentRef: ComponentRef<HideoutListFilters>;
  let fixture: ComponentFixture<HideoutListFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HideoutListFilters],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(HideoutListFilters);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    componentRef.setInput('base-data', { tags: [], maps: [] });

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
