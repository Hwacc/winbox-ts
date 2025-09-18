import type { IWinBox, WinBoxControlType } from '.';
import {
  addClass,
  addListener,
  getByClass,
  hasClass,
  removeClass,
  removeListener,
  setStyle,
  setText,
} from './helper';

abstract class WinBoxBase implements IWinBox {
  id: string = '';
  title: string = '';
  dom!: HTMLElement;
  body!: HTMLElement;

  index: number = 0;
  header: number = 0;

  x: number = 0;
  y: number = 0;
  width: number = 0;
  height: number = 0;
  minwidth: number = 0;
  minheight: number = 0;
  maxwidth: number = 0;
  maxheight: number = 0;
  left: number = 0;
  right: number = 0;
  top: number = 0;
  bottom: number = 0;
  overflow: boolean = false;
  min: boolean = false;
  max: boolean = false;
  full: boolean = false;
  hidden: boolean = false;
  focused: boolean = false;

  onclose: (this: IWinBox, force: boolean | undefined, ...args: any[]) => boolean = () => false;
  onfocus: (this: IWinBox) => void = () => {};
  onblur: (this: IWinBox) => void = () => {};
  onmove: (this: IWinBox, x: number, y: number) => void = () => {};
  onresize: (this: IWinBox, width: number, height: number) => void = () => {};
  onfullscreen: (this: IWinBox) => void = () => {};
  onmaximize: (this: IWinBox) => void = () => {};
  onminimize: (this: IWinBox) => void = () => {};
  onrestore: (this: IWinBox) => void = () => {};
  onhide: (this: IWinBox) => void = () => {};
  onshow: (this: IWinBox) => void = () => {};

  abstract focus(state?: boolean): IWinBox;
  abstract blur(state?: boolean): IWinBox;
  abstract minimize(state?: boolean): IWinBox;
  abstract restore(): IWinBox;
  abstract maximize(state?: boolean): IWinBox;
  abstract fullscreen(state?: boolean): IWinBox;
  abstract close(force?: boolean, ...args: any[]): boolean | undefined;
  abstract move(x?: string | number, y?: string | number, skipUpdate?: boolean): IWinBox;
  abstract resize(w?: string | number, h?: string | number, skipUpdate?: boolean): IWinBox;
  abstract fit(): IWinBox;
  abstract lock(x?: 'center', y?: 'center'): IWinBox;

  setBackground(background?: string): IWinBox {
    if (!background) return this;
    setStyle(this.dom, 'background', background);
    return this;
  }
  setBorder(border?: number): IWinBox {
    if (!border) return this;
    setStyle(this.body, 'margin', border + (isNaN(border) ? '' : 'px'));
    return this;
  }
  setHeader(header?: number): IWinBox {
    if (!header) return this;
    const node = getByClass(this.dom, 'wb-header');
    if (node) {
      setStyle(node, 'height', header + 'px');
      setStyle(node, 'line-height', header + 'px');
      setStyle(this.body, 'top', header + 'px');
    }
    return this;
  }
  setTitle(title?: string): IWinBox {
    if (!title) return this;
    const node = getByClass(this.dom, 'wb-title');
    node && setText(node, (this.title = title));
    return this;
  }
  setIcon(src?: string): IWinBox {
    if (!src) return this;
    const img = getByClass(this.dom, 'wb-icon');
    if (img) {
      setStyle(img, 'background-image', 'url(' + src + ')');
      setStyle(img, 'display', 'inline-block');
    }
    return this;
  }

  setUrl(url: string, onload?: () => void): IWinBox {
    const node = this.body.firstChild as HTMLIFrameElement;
    if (node && node.tagName.toLowerCase() === 'iframe') {
      node.src = url;
    } else {
      this.body.innerHTML = '<iframe src="' + url + '"></iframe>';
      if (this.body.firstChild && onload) {
        (this.body.firstChild as HTMLIFrameElement).onload = onload;
      }
    }
    return this;
  }

  mount(src?: Element) {
    if (!src) return this;
    this.unmount();
    (src as any)._backstore || ((src as any)._backstore = src.parentNode);
    this.body.textContent = '';
    this.body.appendChild(src);
    return this;
  }

  unmount(dest?: Element) {
    const node = this.body.firstChild;
    if (node) {
      const root = dest || (node as any)._backstore;
      root && root.appendChild(node);
      (node as any)._backstore = dest;
    }
    return this;
  }

  show(state?: boolean): IWinBox {
    if (state === false) {
      return this.hide();
    }
    if (this.hidden) {
      this.onshow && this.onshow.call(this);
      this.hidden = false;
      this.addClass('show');
      const _onAnimationEnd = () => {
        this.removeClass('show');
        removeListener(this.dom, 'animationend', _onAnimationEnd);
      };
      addListener(this.dom, 'animationend', _onAnimationEnd);
      return this.removeClass('hide');
    }
    return this;
  }

  hide(state?: boolean): IWinBox {
    if (state === false) {
      return this.show();
    }
    if (!this.hidden) {
      this.onhide && this.onhide.call(this);
      this.hidden = true;
      this.removeClass('show');
      return this.addClass('hide');
    }
    return this;
  }

  addControl(control: WinBoxControlType): IWinBox {
    const classname = control['class'];
    const image = control.image;
    const click = control.click;
    const index = control.index;
    const node = document.createElement('span');
    const icons = getByClass(this.dom, 'wb-control');
    const self = this;

    if (classname) node.className = classname;
    if (image) setStyle(node, 'background-image', 'url(' + image + ')');
    if (click)
      node.onclick = function (event) {
        click.call(this, event, self);
      };
    icons && icons.insertBefore(node, icons.childNodes[index || 0]);
    return this;
  }

  removeControl(classname: string): IWinBox {
    const node = getByClass(this.dom, classname);
    node && node.remove();
    return this;
  }

  addClass(classname: string): IWinBox {
    addClass(this.dom, classname);
    return this;
  }

  removeClass(classname: string): IWinBox {
    removeClass(this.dom, classname);
    return this;
  }

  hasClass(classname: string): boolean {
    return hasClass(this.dom, classname);
  }

  toggleClass(classname: string): IWinBox {
    return this.hasClass(classname) ? this.removeClass(classname) : this.addClass(classname);
  }
}

export default WinBoxBase;