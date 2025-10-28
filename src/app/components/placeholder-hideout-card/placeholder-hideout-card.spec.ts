import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { PlaceholderHideoutCard } from './placeholder-hideout-card';

describe('PlaceholderHideoutCard', () => {
  let component: PlaceholderHideoutCard;
  let fixture: ComponentFixture<PlaceholderHideoutCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaceholderHideoutCard],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(PlaceholderHideoutCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
