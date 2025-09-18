import type { WinBox } from '.';
import { addListener } from './helper';

let instance: WinBoxManager;
export class WinBoxManager {
  use_raf: boolean = true;
  stack_min: WinBox[] = [];
  stack_win: WinBox[] = [];
  id_counter: number = 0;
  index_counter: number = 10;
  prefix_request: string = '';
  prefix_exit: string = '';
  root_w: number = 0;
  root_h: number = 0;
  root_w_delta: number = 0;
  root_h_delta: number = 0;
  window_clicked: boolean = false;
  is_fullscreen: boolean = false;

  constructor() {
    this.setup();
  }

  setup() {
    document.body[(this.prefix_request = 'requestFullscreen')] ||
      // @ts-expect-error ms core
      document.body[(this.prefix_request = 'msRequestFullscreen')] ||
      // @ts-expect-error webkit core
      document.body[(this.prefix_request = 'webkitRequestFullscreen')] ||
      // @ts-expect-error mozilla core
      document.body[(this.prefix_request = 'mozRequestFullscreen')] ||
      (this.prefix_request = '');

    this.prefix_exit =
      this.prefix_request &&
      this.prefix_request
        .replace('request', 'exit')
        .replace('mozRequest', 'mozCancel')
        .replace('Request', 'Exit');

    this.root_w = document.documentElement.clientWidth;
    this.root_h = document.documentElement.clientHeight;

    addListener(window, 'resize', () => {
      const cw = document.documentElement.clientWidth;
      const ch = document.documentElement.clientHeight;
      this.root_w_delta = this.root_w - cw;
      this.root_h_delta = this.root_h - ch;
      this.root_w = cw;
      this.root_h = ch;
      this.stack_win.forEach((box) => {
        if (box) {
          box.isUnderWMResizeControl = true;
          box.changeSizeLimit();
        }
      });
      this.update_min_stack();
    });
  }

  update_min_stack() {
    const length = this.stack_min.length;
    const splitscreen_index: Record<string, number> = {};
    const splitscreen_length: Record<string, number> = {};

    for (let i = 0; i < length; i++) {
      const box = this.stack_min[i];
      const key = box.left + ':' + box.top;

      if (splitscreen_length[key]) {
        splitscreen_length[key]++;
      } else {
        splitscreen_index[key] = 0;
        splitscreen_length[key] = 1;
      }
    }

    for (let i = 0; i < length; i++) {
      const box = this.stack_min[i];
      const key = box.left + ':' + box.top;
      const width = Math.min(
        (this.root_w - (box.left ?? 0) - (box.right ?? 0)) / splitscreen_length[key],
        250
      );
      box
        .resize((width + 1) | 0, box.header, true)
        .move(
          ((box.left ?? 0) + splitscreen_index[key] * width) | 0,
          this.root_h - (box.bottom ?? 0) - (box.header ?? 0),
          true
        );
      splitscreen_index[key]++;
    }
  }

  remove_min_stack(box: WinBox) {
    this.stack_min.splice(this.stack_min.indexOf(box), 1);
    this.update_min_stack();
    box.removeClass('min');
    box.min = false;
    (box.dom as HTMLElement).title = '';
  }

  cancel_fullscreen() {
    this.is_fullscreen = false;
    if (this.has_fullscreen()) {
      // exitFullscreen is executed as async and returns promise.
      // the important part is that the promise callback runs before the event "onresize" was fired!
      (document as any)[this.prefix_exit]?.();
      return true;
    }
  }

  has_fullscreen() {
    return (
      document['fullscreen'] ||
      document['fullscreenElement'] ||
      // @ts-expect-error webkit core
      document['webkitFullscreenElement'] ||
      // @ts-expect-error mozilla core
      document['mozFullScreenElement']
    );
  }

  focus_next() {
    const stack_length = this.stack_win.length;
    if (stack_length) {
      for (let i = stack_length - 1; i >= 0; i--) {
        const last_focus = this.stack_win[i];
        if (!last_focus.min /*&& last_focus !== this*/) {
          last_focus.focus();
          break;
        }
      }
    }
  }

  static getInstance(): WinBoxManager {
    if (!instance) {
      instance = new WinBoxManager();
    }
    return instance;
  }
}
