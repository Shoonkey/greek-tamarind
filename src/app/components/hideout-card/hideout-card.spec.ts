import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef, provideZonelessChangeDetection } from '@angular/core';

import { mockedHideoutMetadata } from '../../mocks/hideout-metadata';
import { HideoutCard } from './hideout-card';
import { ActivatedRoute } from '@angular/router';

describe('HideoutCard', () => {
  let component: HideoutCard;
  let componentRef: ComponentRef<HideoutCard>;
  let fixture: ComponentFixture<HideoutCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HideoutCard],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: ActivatedRoute,
          useValue: null,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HideoutCard);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    componentRef.setInput('hideout', mockedHideoutMetadata);

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
