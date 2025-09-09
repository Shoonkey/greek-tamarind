import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef, provideZonelessChangeDetection } from '@angular/core';

import { mockedHideout } from '../../mocks/hideout';
import { HideoutPage } from './hideout-page';

describe('HideoutPage', () => {
  let component: HideoutPage;
  let componentRef: ComponentRef<HideoutPage>;
  let fixture: ComponentFixture<HideoutPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HideoutPage],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(HideoutPage);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    componentRef.setInput('hideout', mockedHideout);

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
