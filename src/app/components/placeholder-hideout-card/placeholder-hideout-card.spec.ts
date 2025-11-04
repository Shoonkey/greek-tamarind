import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { PlaceholderHideoutCard } from './placeholder-hideout-card';

describe('PlaceholderHideoutCard', () => {
  let component: PlaceholderHideoutCard;
  let fixture: ComponentFixture<PlaceholderHideoutCard>;
  let htmlElement: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaceholderHideoutCard],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(PlaceholderHideoutCard);
    component = fixture.componentInstance;
    htmlElement = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a single parent element, with the class .placeholder-hideout-card', () => {
    const parentElements = htmlElement.children;
    expect(parentElements.length).withContext('should have only one parent element').toBe(1);

    const parentElement = parentElements[0];
    expect(parentElement.classList)
      .withContext('should have the .placeholder-hideout-card class')
      .toContain('placeholder-hideout-card');
  });

  it('should render a single .placeholder as a direct child element (for the image)', () => {
    const parentElement = htmlElement.children[0];
    expect(parentElement.querySelectorAll('& > .placeholder').length).toBe(1);
  });

  it('should render two rows within a container element', () => {
    const rows = htmlElement.querySelectorAll('.row');
    expect(rows.length).withContext('should have exactly 2 rows').toBe(2);

    expect(rows[0].parentElement)
      .withContext('the rows should have the same parent element')
      .toBe(rows[1].parentElement);
  });

  it("the first row should have two placeholders (for hideout's name and author)", () => {
    const firstRow = htmlElement.querySelector('.row:first-child')!;
    expect(firstRow).withContext('A first row should exist').toBeTruthy();

    const placeholdersWithin = firstRow.querySelectorAll('.placeholder');
    expect(placeholdersWithin.length).toBe(2);
  });

  it('the second row should render a .placeholder (for the map name) and a .chip-container (for chip-like info)', () => {
    const secondRow = htmlElement.querySelector('.row:nth-child(2)')!;
    expect(secondRow).withContext('A second row should exist').toBeTruthy();

    const childrenElements = secondRow.children;
    expect(childrenElements.length).withContext('should render 2 elements').toBe(2);

    const [mapNameElt, chipContainerElt] = childrenElements;
    expect(mapNameElt.classList).toContain('placeholder');
    expect(chipContainerElt.classList).toContain('chip-container');
  });

  it(".chip-container should only render .chip's that are also .placeholder's", () => {
    const chipContainer = htmlElement.querySelector('.chip-container')!;
    expect(chipContainer).withContext('.chip-container should exist').toBeTruthy();

    const placeholderChips = chipContainer.querySelectorAll('& > .chip.placeholder');
    expect(placeholderChips.length)
      .withContext('should render only chips that are also placeholders')
      .toBe(chipContainer.children.length);
  });
});
