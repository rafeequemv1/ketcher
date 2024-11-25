import {
  CoordinateTransformation,
  Vec2,
  fromMultitailArrowCreation,
} from 'ketcher-core';
import { ArrowAddTool } from './arrow.types';
import Editor from '../../Editor';

export class MultitailArrowAddTool implements ArrowAddTool {
  static MIN_HEIGHT = 2.5;
  static MIN_WIDTH = 1.2;

  // eslint-disable-next-line no-useless-constructor
  constructor(private editor: Editor) {}

  private get render() {
    return this.editor.render;
  }

  private get reStruct() {
    return this.render.ctab;
  }

  mousedown() {
    // should be empty
  }

  mousemove() {
    // should be empty
  }

  mouseup(event: MouseEvent) {
    const click = CoordinateTransformation.pageToModel(event, this.render);
    const start = new Vec2(click.x, click.y - MultitailArrowAddTool.MIN_HEIGHT);
    const end = this.getArrowWithMinimalSizeEnd(start);

    this.editor.update(fromMultitailArrowCreation(this.reStruct, start, end));
  }

  private getArrowWithMinimalSizeEnd(start: Vec2): Vec2 {
    return new Vec2(
      start.x + MultitailArrowAddTool.MIN_WIDTH,
      start.y + MultitailArrowAddTool.MIN_HEIGHT,
    );
  }
}
