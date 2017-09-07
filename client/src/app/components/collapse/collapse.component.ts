import { Component, OnInit, Directive, OnChanges, ElementRef, Input } from '@angular/core';
import { AnimationBuilder, style, animate } from '@angular/animations';

@Component({
  selector: 'mvw-collapse',
  templateUrl: './collapse.component.html',
  styleUrls: ['./collapse.component.scss']
})
export class CollapseComponent implements OnInit {
  collapse: boolean = true;
  show: boolean = false;
  collapsing: boolean = false;


  constructor(private animationBuilder: AnimationBuilder, private element: ElementRef) {
  }

  ngOnInit() {
  }


  hide() {
    const initialHeight = this.element.nativeElement.scrollHeight;

    const hideAnimation = this.animationBuilder.build([
      style({ height: initialHeight + 'px', overflow: 'hidden' }),

      animate(250, style({ height: '0px', paddingTop: 0, paddingBottom: 0 }))
    ]);

    const player = hideAnimation.create(this.element.nativeElement);

    player.onStart(() => {
      this.collapse = false;
      this.show = false;
      this.collapsing = true;
    });

    player.onDone(() => {
      this.collapse = true;
      this.show = true;
      this.collapsing = false;
    });
  }

}
