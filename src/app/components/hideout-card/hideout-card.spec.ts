import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef, provideZonelessChangeDetection } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { mockHideoutMetadata } from '../../mocks/hideout-metadata';
import { HideoutCard } from './hideout-card';
import { HideoutImage } from '../../models/HideoutImage';
import { TruncatePipe } from '../../pipes/truncate-pipe/truncate-pipe';

function getNImages(n: number) {
  const arr = new Array<HideoutImage>(n);

  for (let i = 0; i < n; i++)
    arr[i] = {
      url: `http://localhost:3000/image-${i + 1}.png`,
      alt: `Image ${i + 1}`,
    };

  return arr;
}

function replaceNbspWithSpace(text: string) {
  return text.replace('\u00A0', ' ');
}

describe('HideoutCard', () => {
  let component: HideoutCard;
  let componentRef: ComponentRef<HideoutCard>;
  let fixture: ComponentFixture<HideoutCard>;
  let nativeElt: HTMLElement;

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
    nativeElt = fixture.nativeElement;
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    componentRef.setInput('hideout', mockHideoutMetadata);

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('should have', () => {
    describe('hideout title element', () => {
      let hideoutTitleElt: HTMLElement;

      beforeEach(() => {
        hideoutTitleElt = nativeElt.querySelector('.user-hideout-name')!;
      });

      it('should exist', () => {
        expect(hideoutTitleElt).not.toBeNull();
      });

      it('should have the title as text', () => {
        expect(hideoutTitleElt.innerText).toBe(mockHideoutMetadata.name);
      });

      it("should truncate title if it's bigger than 24 characters", async () => {
        const makeStrOfLen = (n: number) => {
          let str = '';
          for (let i = 0; i < n; i++) str += '_';
          return str;
        };

        const newName = makeStrOfLen(25);
        componentRef.setInput('hideout', {
          ...mockHideoutMetadata,
          name: newName,
        });

        await fixture.whenStable();

        expect(hideoutTitleElt.innerText).not.toBe(newName);

        const expectedTruncatedText = new TruncatePipe().transform(newName, 24);
        expect(hideoutTitleElt.innerText).toBe(expectedTruncatedText);
      });
    });

    describe('author username element', () => {
      let authorUsernameElt: HTMLElement;

      beforeEach(() => {
        authorUsernameElt = nativeElt.querySelector('.author')!;
      });

      it('should exist', () => {
        expect(authorUsernameElt).not.toBeNull();
      });

      it('should have `by {username}` as text', () => {
        expect(authorUsernameElt.innerText).toBe(`by ${mockHideoutMetadata.author}`);
      });

      it("should have a link to the user's profile", () => {
        const profileLinkElt: HTMLAnchorElement = authorUsernameElt.querySelector('a')!;
        expect(profileLinkElt).withContext('link should exist').not.toBeNull();
        expect(profileLinkElt.innerText)
          .withContext('link should be around the author username')
          .toBe(mockHideoutMetadata.author);
        expect(profileLinkElt.href.endsWith(`/user/${mockHideoutMetadata.author}`))
          .withContext("link should point to user's profile")
          .toBeTrue();
      });
    });

    describe('map name element', () => {
      let mapNameElt: HTMLElement;

      beforeEach(() => {
        mapNameElt = nativeElt.querySelector('.map-name')!;
      });

      it('should exist', () => {
        expect(mapNameElt).not.toBeNull();
      });

      it('should have map name as text', () => {
        expect(mapNameElt.innerText).toBe(mockHideoutMetadata.map.name);
      });
    });

    describe('PoE version element', () => {
      let poeVersionElt: HTMLElement;

      beforeEach(() => {
        poeVersionElt = nativeElt.querySelector('.short-info-group p:first-child')!;
      });

      it('should exist', () => {
        expect(poeVersionElt).not.toBeNull();
      });

      it('should have `POE {version}` as text', () => {
        const text = replaceNbspWithSpace(poeVersionElt.textContent.trim());
        expect(text).toBe(`POE ${mockHideoutMetadata.poeVersion}`);
      });
    });

    describe('rating element', () => {
      let ratingElt: HTMLElement;

      beforeEach(() => {
        ratingElt = nativeElt.querySelector('.short-info-group p:nth-child(2)')!;
      });

      it('should exist', () => {
        expect(ratingElt).not.toBeNull();
      });

      it('should have `{rating}/5` as text', () => {
        function takeIconOff(elt: HTMLElement) {
          const innerMatIcon = elt.querySelector('mat-icon');

          if (!innerMatIcon) return;

          elt.removeChild(innerMatIcon);
        }

        function takeWhitespaceOff(text: string) {
          return text.replace(/\s/g, '');
        }

        takeIconOff(ratingElt);

        expect(takeWhitespaceOff(ratingElt.textContent)).toBe(`${mockHideoutMetadata.rating}/5`);
      });

      it('should have star icon', () => {
        const icon = ratingElt.querySelector('mat-icon')!;
        expect(icon).withContext('icon should exist').not.toBeNull();
        expect(icon.textContent).toBe('star');
      });
    });

    describe('MTX element', () => {
      let mtxElt: HTMLElement;

      beforeEach(() => {
        mtxElt = nativeElt.querySelector('.short-info-group p:nth-child(3)')!;
      });

      it('should exist', () => {
        expect(mtxElt).not.toBeNull();
      });

      it('should have `Mtx: {Yes|No}` as text', async () => {
        function getMtxText() {
          return replaceNbspWithSpace(mtxElt.textContent).trim();
        }

        componentRef.setInput('hideout', {
          ...mockHideoutMetadata,
          hasMTX: true,
        });
        await fixture.whenStable();

        expect(getMtxText()).withContext('should be Yes for hasMTX=true').toBe('MTX: Yes');

        componentRef.setInput('hideout', {
          ...mockHideoutMetadata,
          hasMTX: false,
        });
        await fixture.whenStable();

        expect(getMtxText()).withContext('should be Yes for hasMTX=false').toBe('MTX: No');
      });
    });

    describe('image gallery', () => {
      let imgGalleryElt: HTMLElement;
      let mockImages: HideoutImage[];

      beforeEach(async () => {
        mockImages = getNImages(4);

        componentRef.setInput('hideout', {
          ...mockHideoutMetadata,
          images: mockImages,
        });

        await fixture.whenStable();

        imgGalleryElt = nativeElt.querySelector('.img-gallery')!;
      });

      it('should exist', () => {
        expect(imgGalleryElt).not.toBeNull();
      });

      describe('selected image', () => {
        let selectedImgElt: HTMLImageElement;

        beforeEach(() => {
          selectedImgElt = nativeElt.querySelector('.img-gallery .selected-img')!;
        });

        it('should exist', () => {
          expect(selectedImgElt).not.toBeNull();
        });

        it('should render image according to `selectedImgIdx`', async () => {
          expect(selectedImgElt.src)
            .withContext('by default, first img src should be assigned to .selected-img')
            .toBe(mockImages[0].url);

          expect(selectedImgElt.alt)
            .withContext('by default, first img alt text should be assigned to .selected-img')
            .toBe(mockImages[0].alt);

          const randomOtherImgIdx = Math.floor(Math.random() * (mockImages.length - 1)) + 1;
          component.selectedImgIdx.set(randomOtherImgIdx);
          await fixture.whenStable();

          expect(selectedImgElt.src)
            .withContext('when `selectedImgIdx` changes, the img src should update accordingly')
            .toBe(mockImages[randomOtherImgIdx].url);

          expect(selectedImgElt.alt)
            .withContext(
              'when `selectedImgIdx` changes,  the img alt text should update accordingly',
            )
            .toBe(mockImages[randomOtherImgIdx].alt);
        });
      });

      describe('image miniature list', () => {
        let miniatureList: HTMLElement;
        let miniatureImgs: NodeListOf<HTMLImageElement>;

        beforeEach(() => {
          miniatureList = nativeElt.querySelector('.miniature-list')!;
          miniatureImgs = miniatureList.querySelectorAll('.miniature-img');
        });

        it('should exist', () => {
          expect(miniatureList).not.toBeNull();
        });

        it('should contain every hideout image as a .miniature-img', () => {
          expect(miniatureImgs.length).toBe(mockImages.length);
        });

        it('should update `selectedImgIdx` when a .miniature-img is clicked', async () => {
          const randomMiniatureImgIdx = Math.floor(Math.random() * miniatureImgs.length);
          miniatureImgs[randomMiniatureImgIdx].click();
          expect(component.selectedImgIdx()).toBe(randomMiniatureImgIdx);
        });
      });
    });
  });
});
