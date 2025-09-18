import type { IWinBox, WinBoxParams } from '.';
import {
  addClass,
  addListener,
  getByClass,
  parse,
  preventEvent,
  removeClass,
  removeListener,
  setStyle,
  clsx,
} from './helper';
import template from './template';
import WinBoxBase from './winboxBase';
import { WinBoxManager } from './winboxManager';

type EventOptions = { capture: boolean; passive: boolean };

class WinBox extends WinBoxBase {
  private wm: WinBoxManager;
  private params: WinBoxParams;
  private eventOptions: EventOptions = { capture: true, passive: false };
  private eventOptionsPassive: EventOptions = { capture: true, passive: true };

  isUnderWMResizeControl: boolean = false;
  
  constructor(params: WinBoxParams) {
    super();
    this.wm = WinBoxManager.getInstance();
    let {
      id,
      root,
      mount,
      tpl,
      class: classname,
      modal,
      background,
      border = 0,
      header,
      title = '',
      icon,
      html,
      url,
      top,
      bottom,
      left,
      right,
      maxwidth,
      maxheight,
      minwidth,
      minheight,
      autosize,
      animate,
      width,
      height,
      x,
      y,
      index,
      overflow,
      hidden,
      max,
      min,

      oncreate,
      onclose,
      onfocus,
      onblur,
      onmove,
      onresize,
      onfullscreen,
      onminimize,
      onmaximize,
      onrestore,
      onhide,
      onshow,
      onload,
    } = params;

    this.params = params;
    this.dom = template(tpl);
    this.dom.id = id || 'winbox-' + ++this.wm.id_counter;
    this.dom.className = clsx('winbox', classname, animate ? 'animate' : '', modal ? 'modal' : '');
    (this.dom as any)['winbox'] = this;

    this.body = getByClass(this.dom, 'wb-body')!;
    this.wm.stack_win.push(this);

    this.setBackground(background);
    this.setBorder(border);
    this.setHeader(header);
    this.setTitle(title);
    this.setIcon(icon);

    if (mount) {
      this.mount(mount);
    } else if (html) {
      this.body.innerHTML = html;
    } else if (url) {
      this.setUrl(url, onload);
    }

    top = top ? parse(top, this.wm.root_h) : 0;
    bottom = bottom ? parse(bottom, this.wm.root_h) : 0;
    left = left ? parse(left, this.wm.root_w) : 0;
    right = right ? parse(right, this.wm.root_w) : 0;

    maxwidth = maxwidth ? parse(maxwidth, this.wm.root_w) : this.wm.root_w;
    maxheight = maxheight ? parse(maxheight, this.wm.root_h) : this.wm.root_h;

    minwidth = minwidth ? parse(minwidth, maxwidth) : 150;
    minheight = minheight ? parse(minheight, maxheight) : header ?? 35;

    if (autosize) {
      (root || document.body).appendChild(this.body);
      width = Math.max(Math.min(this.wm.root_w + border * 2 + 1, maxwidth), minwidth);
      height = Math.max(Math.min(this.wm.root_h + this.header + border + 1, maxheight), minheight);
      this.dom.appendChild(this.body);
    } else {
      width = width ? parse(width, maxwidth) : Math.max(maxwidth / 2, minwidth) | 0;
      height = height ? parse(height, maxheight) : Math.max(maxheight / 2, minheight) | 0;
    }

    x = x ? parse(x, this.wm.root_w, width) : left;
    y = y ? parse(y, this.wm.root_h, height) : top;

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.minwidth = minwidth;
    this.minheight = minheight;
    this.maxwidth = maxwidth;
    this.maxheight = maxheight;
    this.top = top;
    this.right = right;
    this.bottom = bottom;
    this.left = left;
    this.overflow = overflow ?? false;
    this.min = false;
    this.max = false;
    this.full = false;
    this.hidden = false;
    this.focused = false;

    this.onclose = onclose ?? (() => false);
    this.onfocus = onfocus ?? (() => {});
    this.onblur = onblur ?? (() => {});
    this.onmove = onmove ?? (() => {});
    this.onresize = onresize ?? (() => {});
    this.onfullscreen = onfullscreen ?? (() => {});
    this.onmaximize = onmaximize ?? (() => {});
    this.onminimize = onminimize ?? (() => {});
    this.onrestore = onrestore ?? (() => {});
    this.onhide = onhide ?? (() => {});
    this.onshow = onshow ?? (() => {});

    hidden ? this.hide() : this.focus();

    if (index || index === 0) {
      this.index = index;
      setStyle(this.dom, 'z-index', index);
      if (index > this.wm.index_counter) this.wm.index_counter = index;
    }

    if (max) {
      this.maximize();
    } else if (min) {
      this.minimize();
    } else {
      this.resize().move().fit();
    }

    this.registerListeners();
    (root || document.body).appendChild(this.dom);
    oncreate && oncreate.call(this, params);
  }

  private registerListeners() {
    this.addWindowListener('drag');
    this.addWindowListener('n');
    this.addWindowListener('s');
    this.addWindowListener('w');
    this.addWindowListener('e');
    this.addWindowListener('nw');
    this.addWindowListener('ne');
    this.addWindowListener('se');
    this.addWindowListener('sw');

    const minButton = getByClass(this.dom, 'wb-min');
    minButton &&
      addListener(minButton, 'click', (event) => {
        preventEvent(event);
        this.min ? this.restore().focus() : this.minimize();
      });

    const maxButton = getByClass(this.dom, 'wb-max');
    maxButton &&
      addListener(maxButton, 'click', (event) => {
        preventEvent(event);
        this.max ? this.restore().focus() : this.maximize().focus();
      });

    if (this.wm.prefix_request) {
      const fullButton = getByClass(this.dom, 'wb-full');
      fullButton &&
        addListener(fullButton, 'click', (event) => {
          preventEvent(event);
          this.fullscreen().focus();
        });
    } else {
      this.addClass('no-full');
    }

    const closeButton = getByClass(this.dom, 'wb-close');
    closeButton &&
      addListener(closeButton, 'click', (event) => {
        preventEvent(event);
        this.close();
      });

    addListener(
      this.dom,
      'mousedown',
      () => {
        this.wm.window_clicked = true;
      },
      true
    );
    addListener(
      this.body,
      'mousedown',
      () => {
        // stop propagation would disable global listeners used inside window contents
        // use event bubbling for this listener to skip this handler by the other click listeners
        this.focus();
      },
      true
    );
  }

  private addWindowListener(dir: string) {
    const node = getByClass(this.dom, 'wb-' + dir);
    if (!node) return;

    let touch: any, x: number, y: number;
    let raf_timer: number, raf_move: boolean, raf_resize: boolean;
    let dblclick_timer = 0;

    const loop = () => {
      raf_timer = requestAnimationFrame(loop);
      if (raf_resize) {
        this.resize();
        raf_resize = false;
      }

      if (raf_move) {
        this.move();
        raf_move = false;
      }
    };

    const handler_mousedown = (event: any) => {
      // prevent the full iteration through the fallback chain of a touch event (touch > mouse > click)
      preventEvent(event, true);
      //window_clicked = true;
      this.focus();

      if (dir === 'drag') {
        if (this.min) {
          this.restore();
          return;
        }

        if (!this.hasClass('no-max')) {
          const now = Date.now();
          const diff = now - dblclick_timer;

          dblclick_timer = now;

          if (diff < 300) {
            this.max ? this.restore() : this.maximize();
            return;
          }
        }
      }

      if (!this.min) {
        addClass(this.body, 'wb-lock');
        this.wm.use_raf && loop();
        if ((touch = (event as TouchEvent).touches) && (touch = touch[0])) {
          event = touch;
          addListener(window, 'touchmove', handler_mousemove, this.eventOptionsPassive);
          addListener(window, 'touchend', handler_mouseup, this.eventOptionsPassive);
        } else {
          addListener(window, 'mousemove', handler_mousemove, this.eventOptionsPassive);
          addListener(window, 'mouseup', handler_mouseup, this.eventOptionsPassive);
        }
        x = (event as MouseEvent).pageX;
        y = (event as MouseEvent).pageY;
      }
    };

    addListener(node, 'mousedown', handler_mousedown, this.eventOptions);
    addListener(node, 'touchstart', handler_mousedown, this.eventOptions);

    const handler_mousemove = (event: any) => {
      preventEvent(event);

      if (touch) {
        event = event.touches[0];
      }

      const pageX = event.pageX;
      const pageY = event.pageY;
      const offsetX = pageX - x;
      const offsetY = pageY - y;

      const old_w = this.width;
      const old_h = this.height;
      const old_x = this.x;
      const old_y = this.y;

      let resize_w, resize_h, move_x, move_y;

      if (dir === 'drag') {
        if (this.hasClass('no-move')) return;
        this.x += offsetX;
        this.y += offsetY;
        move_x = move_y = 1;
      } else {
        if (dir === 'e' || dir === 'se' || dir === 'ne') {
          this.width += offsetX;
          resize_w = 1;
        } else if (dir === 'w' || dir === 'sw' || dir === 'nw') {
          this.x += offsetX;
          this.width -= offsetX;
          resize_w = 1;
          move_x = 1;
        }
        if (dir === 's' || dir === 'se' || dir === 'sw') {
          this.height += offsetY;
          resize_h = 1;
        } else if (dir === 'n' || dir === 'ne' || dir === 'nw') {
          this.y += offsetY;
          this.height -= offsetY;
          resize_h = 1;
          move_y = 1;
        }
      }

      if (resize_w) {
        this.width = Math.max(
          Math.min(this.width, this.maxwidth, this.wm.root_w - this.x - this.right),
          this.minwidth
        );
        resize_w = this.width !== old_w;
      }

      if (resize_h) {
        this.height = Math.max(
          Math.min(this.height, this.maxheight, this.wm.root_h - this.y - this.bottom),
          this.minheight
        );
        resize_h = this.height !== old_h;
      }

      if (resize_w || resize_h) {
        this.wm.use_raf ? (raf_resize = true) : this.resize();
      }

      if (move_x) {
        if (this.max) {
          this.x =
            (pageX < this.wm.root_w / 3
              ? this.left
              : pageX > (this.wm.root_w / 3) * 2
              ? this.wm.root_w - this.width - this.right
              : this.wm.root_w / 2 - this.width / 2) + offsetX;
        }

        this.x = Math.max(
          Math.min(
            this.x,
            this.overflow ? this.wm.root_w - 30 : this.wm.root_w - this.width - this.right
          ),
          this.overflow ? 30 - this.width : this.left
        );
        move_x = this.x !== old_x;
      }

      if (move_y) {
        if (this.max) {
          this.y = this.top + offsetY;
        }

        this.y = Math.max(
          Math.min(
            this.y,
            this.overflow
              ? this.wm.root_h - this.header
              : this.wm.root_h - this.height - this.bottom
          ),
          this.top
        );
        move_y = this.y !== old_y;
      }

      if (move_x || move_y) {
        if (this.max) {
          this.restore();
        }
        this.wm.use_raf ? (raf_move = true) : this.move();
      }

      if (resize_w || move_x) {
        x = pageX;
      }

      if (resize_h || move_y) {
        y = pageY;
      }
    };

    const handler_mouseup = (event: any) => {
      preventEvent(event);
      removeClass(this.body, 'wb-lock');
      this.wm.use_raf && cancelAnimationFrame(raf_timer);
      if (touch) {
        //removeListener(self.dom, "touchmove", preventEvent);
        removeListener(window, 'touchmove', handler_mousemove, this.eventOptionsPassive);
        removeListener(window, 'touchend', handler_mouseup, this.eventOptionsPassive);
      } else {
        //removeListener(this, "mouseleave", handler_mouseup);
        removeListener(window, 'mousemove', handler_mousemove, this.eventOptionsPassive);
        removeListener(window, 'mouseup', handler_mouseup, this.eventOptionsPassive);
      }
    };
  }

  close(force?: boolean, ...args: any[]): boolean | undefined {
    if (this.onclose && this.onclose.call(this, force, ...args)) {
      return true;
    }
    if (this.min) {
      this.wm.remove_min_stack(this);
    }
    this.wm.stack_win.splice(this.wm.stack_win.indexOf(this), 1);

    this.unmount();
    this.dom.remove();
    this.dom.textContent = '';
    (this.dom as any)['winbox'] = null;
    //@ts-expect-error body should be released
    this.body = null;
    //@ts-expect-error dom should be released
    this.dom = null;
    this.focused && this.wm.focus_next();
  }

  move(x?: string | number, y?: string | number, _skip_update?: boolean) {
    if (!x && x !== 0) {
      x = this.x;
      y = this.y;
    } else if (!_skip_update) {
      this.x = x ? (x = parse(x, this.wm.root_w - this.left - this.right, this.width)) : 0;
      this.y = y ? (y = parse(y, this.wm.root_h - this.top - this.bottom, this.height)) : 0;
    }
    //setStyle(this.dom, "transform", "translate(" + x + "px," + y + "px)");
    setStyle(this.dom, 'left', x + 'px');
    setStyle(this.dom, 'top', y + 'px');
    this.onmove && this.onmove.call(this, this.x, this.y);
    return this;
  }

  resize(w?: string | number, h?: string | number, _skip_update?: boolean) {
    if (!w && w !== 0) {
      w = this.width;
      h = this.height;
    } else if (!_skip_update) {
      this.width = w ? (w = parse(w, this.maxwidth /*- this.left - this.right*/)) : 0;
      this.height = h ? (h = parse(h, this.maxheight /*- this.top - this.bottom*/)) : 0;

      w = Math.max(this.width, this.minwidth);
      h = Math.max(this.height, this.minheight);
    }
    setStyle(this.dom, 'width', w + 'px');
    setStyle(this.dom, 'height', h + 'px');
    this.onresize && this.onresize.call(this, this.width, this.height);
    return this;
  }

  fit(offset: number[] = [20, 20]) {
    const { root_w, root_h } = this.wm;
    const _root_w = root_w - offset[0] * 2;
    const _root_h = root_h - offset[1] * 2;

    const _mX = _root_w - this.width < 0 ? offset[0] : (_root_w - this.width) / 2;
    if (this.x < 0) {
      this.move(offset[0], this.y);
      if (this.width > _root_w) {
        this.resize(_root_w, this.height);
      }
    } else if (this.x + this.width > root_w) {
      if (this.width < _root_w) {
        if(this.isUnderWMResizeControl && !this.hidden){
          this.move(this.x - this.wm.root_w_delta, this.y);
        } else {
          this.move(_mX, this.y);
        }
      } else {
        this.move(_mX, this.y);
        this.resize(_root_w, this.height);
      }
    } else if (this.x > root_w) {
      if (this.width < _root_w) {
        this.move(_mX, this.y);
      } else {
        this.move(offset[0], this.y);
        this.resize(_root_w, this.height);
      }
    }

    const _mY = _root_h - this.height < 0 ? offset[1] : (_root_h - this.height) / 2;
    if (this.y < 0) {
      this.move(this.x, offset[1]);
      if (this.height > _root_h) {
        this.resize(this.width, _root_h);
      }
    } else if (this.y + this.height > root_h) {
      if (this.height < _root_h) {
        if(this.isUnderWMResizeControl && !this.hidden){
          this.move(this.x, this.y - this.wm.root_h_delta);
        } else {
          this.move(this.x, _mY);
        }
      } else {
        this.move(this.x, _mY);
        this.resize(this.width, _root_h);
      }
    } else if (this.y > root_h) {
      if (this.height < _root_h) {
        this.move(this.x, _mY);
      } else {
        this.move(this.x, offset[1]);
        this.resize(this.width, _root_h);
      }
    }
    return this;
  }

  focus(state?: boolean): IWinBox {
    if (state === false) {
      return this.blur();
    }
    if (!this.focused) {
      const stack_length = this.wm.stack_win.length;

      if (stack_length > 1) {
        for (let i = 1; i <= stack_length; i++) {
          const last_focus = this.wm.stack_win[stack_length - i];

          if (last_focus.focused /*&& last_focus !== this*/) {
            last_focus.blur();
            this.wm.stack_win.push(this.wm.stack_win.splice(this.wm.stack_win.indexOf(this), 1)[0]);

            break;
          }
        }
      }

      setStyle(this.dom, 'z-index', ++this.wm.index_counter);
      this.index = this.wm.index_counter;
      this.addClass('focus');
      this.focused = true;
      this.onfocus && this.onfocus.call(this);
    }
    return this;
  }

  blur(state?: boolean) {
    if (state === false) {
      return this.focus();
    }
    if (this.focused) {
      this.removeClass('focus');
      this.focused = false;
      this.onblur && this.onblur.call(this);
    }
    return this;
  }

  minimize(state?: boolean): IWinBox {
    if (state === false) {
      return this.restore();
    }

    if (this.wm.is_fullscreen) {
      this.wm.cancel_fullscreen();
    }

    if (this.max) {
      this.removeClass('max');
      this.max = false;
    }

    if (!this.min) {
      this.wm.stack_min.push(this);
      this.wm.update_min_stack();
      this.dom.title = this.title;
      this.addClass('min');
      this.min = true;

      if (this.focused) {
        this.blur();
        this.wm.focus_next();
      }

      this.onminimize && this.onminimize.call(this);
    }

    return this;
  }

  maximize(state?: boolean): IWinBox {
    if (state === false) {
      return this.restore();
    }

    if (this.wm.is_fullscreen) {
      this.wm.cancel_fullscreen();
    }

    if (this.min) {
      this.wm.remove_min_stack(this);
    }

    if (!this.max) {
      this.addClass('max')
        .resize(
          this.wm.root_w - this.left - this.right,
          this.wm.root_h - this.top - this.bottom /* - 1 */,
          true
        )
        .move(this.left, this.top, true);

      this.max = true;
      this.onmaximize && this.onmaximize.call(this);
    }
    return this;
  }

  restore(): IWinBox {
    if (this.wm.is_fullscreen) {
      this.wm.cancel_fullscreen();
    }

    if (this.min) {
      this.wm.remove_min_stack(this);
      this.resize().move();
      this.onrestore && this.onrestore.call(this);
    }

    if (this.max) {
      this.max = false;
      this.removeClass('max').resize().move();
      this.onrestore && this.onrestore.call(this);
    }
    return this;
  }

  fullscreen(state?: boolean): IWinBox {
    if (this.min) {
      this.wm.remove_min_stack(this);
      this.resize().move();
    }
    // fullscreen could be changed by user manually!
    if (!this.wm.is_fullscreen || !this.wm.cancel_fullscreen()) {
      // requestFullscreen is executed as async and returns promise.
      // in this case it is better to set the state to "this.full" after the requestFullscreen was fired,
      // because it may break when browser does not support fullscreen properly and bypass it silently.
      (this.body as any)[this.wm.prefix_request]?.();
      this.wm.is_fullscreen = true;
      this.full = true;
      this.onfullscreen && this.onfullscreen.call(this);
    } else if (state === false) {
      return this.restore();
    }

    return this;
  }

  lock(x?: number | 'center', _y?: number | 'center') {
    if (x === 'center') {
      this.move((this.wm.root_w - this.width) / 2, this.y);
    }
    return this;
  }

  changeSizeLimit() {
    this.maxwidth = this.params.maxwidth
      ? parse(this.params.maxwidth, this.wm.root_w)
      : this.wm.root_w;
    this.maxheight = this.params.maxheight
      ? parse(this.params.maxheight, this.wm.root_h)
      : this.wm.root_h;

    this.minwidth = this.params.minwidth ? parse(this.params.minwidth, this.maxwidth) : 150;
    this.minheight = this.params.minheight
      ? parse(this.params.minheight, this.maxheight)
      : this.header ?? 35;
  }
}

export default WinBox;
