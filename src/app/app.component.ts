import {
  Component,
  QueryList,
  ViewChild,
  ViewChildren,
  NgZone,
  ElementRef,
} from '@angular/core';
import {
  CdkDragEnter,
  moveItemInArray,
  CdkDragMove,
} from '@angular/cdk/drag-drop';
import { Control } from './control.model';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  public items: Array<number> = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  lockAxis?: any = 'x|y';
  selectedControl?: Control;
  controls?: Control[];

  @ViewChildren('div') divs: QueryList<any>;

  @ViewChildren('resizeBox') resizeBox?: QueryList<ElementRef>;
  @ViewChildren('dragHandleRB') dragHandleRB?: QueryList<ElementRef>;
  @ViewChildren('dragHandleRight') dragHandleRight?: QueryList<ElementRef>;
  @ViewChildren('dragHandleBottom') dragHandleBottom?: QueryList<ElementRef>;

  constructor(private ngZone: NgZone) {
    this.controls = [];
  }

  addControl(): void {
    const templateControl = new Control();
    templateControl.width = 40;
    templateControl.height = 40;
    templateControl.index =
      this.controls === undefined ? 0 : this.controls.length;
    this.controls.push(templateControl);
    this.selectedControl = templateControl;

    this.setCreateHandleTransform();
  }

  setCreateHandleTransform(): void {
    let rect: any = null;
    this.resizeBox!.changes.subscribe(() => {
      rect = this.resizeBox!.filter(
        (element, index) => index === this.selectedControl!.index!
      )[0].nativeElement.getBoundingClientRect();

      this.dragHandleRB!.changes.subscribe(() => {
        this.setHandleTransform(
          this.dragHandleRB!.filter(
            (element, index) => index === this.selectedControl!.index!
          )[0].nativeElement,
          rect,
          'both'
        );
      });

      this.dragHandleBottom!.changes.subscribe(() => {
        this.setHandleTransform(
          this.dragHandleBottom!.filter(
            (element, index) => index === this.selectedControl!.index!
          )[0].nativeElement,
          rect,
          'y'
        );
      });

      this.dragHandleRight!.changes.subscribe(() => {
        this.setHandleTransform(
          this.dragHandleRight!.filter(
            (element, index) => index === this.selectedControl!.index!
          )[0].nativeElement,
          rect,
          'x'
        );
      });
    });
  }

  ngAfterViewInit() {
    this.divs.forEach((div) => console.log(div));
  }

  dragMove(
    dragHandle: HTMLElement,
    $event: CdkDragMove<any>,
    control: Control
  ): void {
    this.selectedControl = control;
    this.ngZone.runOutsideAngular(() => {
      this.resize(
        dragHandle,
        this.resizeBox!.filter((element, index) => index === control.index!)[0]
          .nativeElement
      );
    });
  }

  add() {
    this.items.push(this.items.length + 1);
  }

  setUpdateHandleTransform(): void {
    // eslint-disable-next-line no-console
    // console.log(this.resizeBox);
    const rect = this.resizeBox!.filter(
      (element, index) => index === this.selectedControl!.index!
    )[0].nativeElement.getBoundingClientRect();
    this.setHandleTransform(
      this.dragHandleBottom!.filter(
        (element, index) => index === this.selectedControl!.index!
      )[0].nativeElement,
      rect,
      'y'
    );
    this.setHandleTransform(
      this.dragHandleRB!.filter(
        (element, index) => index === this.selectedControl!.index!
      )[0].nativeElement,
      rect,
      'both'
    );
    this.setHandleTransform(
      this.dragHandleRight!.filter(
        (element, index) => index === this.selectedControl!.index!
      )[0].nativeElement,
      rect,
      'x'
    );
  }

  setHandleTransform(
    dragHandle: HTMLElement,
    targetRect: ClientRect | DOMRect,
    position: 'x' | 'y' | 'both'
  ): void {
    const dragRect = dragHandle.getBoundingClientRect();
    const translateX = targetRect.width - dragRect.width;
    const translateY = targetRect.height - dragRect.height;
    // eslint-disable-next-line no-console
    // console.log(translateX + ':' + translateY);
    if (position === 'x') {
      dragHandle.style.transform = `translate3d(${translateX}px, 0, 0)`;
    }

    if (position === 'y') {
      dragHandle.style.transform = `translate3d(0, ${translateY}px, 0)`;
    }

    if (position === 'both') {
      dragHandle.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
    }
  }

  resize(dragHandle: HTMLElement, target: HTMLElement): void {
    // eslint-disable-next-line no-console
    // console.log(this.templateControls);

    const dragRect = dragHandle.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    //this.selectedControl!.width = dragRect.left - targetRect.left + dragRect.width;
    //this.selectedControl!.height = dragRect.top - targetRect.top + dragRect.height;

    const width = dragRect.left - targetRect.left + dragRect.width;
    const height = dragRect.top - targetRect.top + dragRect.height;

    //this.selectedControl!.width = width;
    //this.selectedControl!.height = height;
    target.style.width = width + 'px';
    target.style.height = height + 'px';

    this.setUpdateHandleTransform();
  }

  shuffle() {
    this.items.sort(function () {
      return 0.5 - Math.random();
    });
  }

  dragEntered(event: CdkDragEnter<number>) {
    const drag = event.item;
    const dropList = event.container;
    const dragIndex = drag.data;
    const dropIndex = dropList.data;

    const phContainer = dropList.element.nativeElement;
    const phElement = phContainer.querySelector('.cdk-drag-placeholder');
    phContainer.removeChild(phElement);
    phContainer.parentElement.insertBefore(phElement, phContainer);

    moveItemInArray(this.items, dragIndex, dropIndex);
  }
}
