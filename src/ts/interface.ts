export type WinBoxParams = {
  id?: string;
  index?: number;
  root?: Node;
  tpl?: Node;
  title?: string;
  icon?: string;
  mount?: Element;
  html?: string;
  url?: string;

  x?: 'right' | 'center' | string | number;
  y?: 'bottom' | 'center' | string | number;
  width?: string | number;
  height?: string | number;
  minwidth?: string | number;
  minheight?: string | number;
  maxwidth?: string | number;
  maxheight?: string | number;
  left?: string | number;
  right?: string | number;
  top?: string | number;
  bottom?: string | number;
  autosize?: boolean;
  overflow?: boolean;
  animate?: boolean;

  min?: boolean;
  max?: boolean;
  hidden?: boolean;
  modal?: boolean;

  background?: string;
  border?: number;
  header?: number;
  class?: string;

  oncreate?: (this: IWinBox, params?: WinBoxParams) => void;
  onclose?: (this: IWinBox, force?: boolean) => boolean;
  onfocus?: (this: IWinBox) => void;
  onblur?: (this: IWinBox) => void;
  onmove?: (this: IWinBox, x: number, y: number) => void;
  onresize?: (this: IWinBox, width: number, height: number) => void;
  onfullscreen?: (this: IWinBox) => void;
  onminimize?: (this: IWinBox) => void;
  onmaximize?: (this: IWinBox) => void;
  onrestore?: (this: IWinBox) => void;
  onhide?: (this: IWinBox) => void;
  onshow?: (this: IWinBox) => void;
  onload?: () => void;
};

export interface IWinBox {
  id: string;
  title: string;
  dom: Node;
  body: HTMLElement;
  index: number;
  header: number;

  x: number;
  y: number;
  width: number;
  height: number;
  minwidth: number;
  minheight: number;
  maxwidth: number;
  maxheight: number;
  left: number;
  right: number;
  top: number;
  bottom: number;

  overflow: boolean;
  min: boolean;
  max: boolean;
  full: boolean;
  hidden: boolean;
  focused: boolean;

  onclose: (this: IWinBox, force: boolean) => boolean;
  onfocus: (this: IWinBox) => void;
  onblur: (this: IWinBox) => void;
  onmove: (this: IWinBox, x: number, y: number) => void;
  onresize: (this: IWinBox, width: number, height: number) => void;
  onfullscreen: (this: IWinBox) => void;
  onmaximize: (this: IWinBox) => void;
  onminimize: (this: IWinBox) => void;
  onrestore: (this: IWinBox) => void;
  onhide: (this: IWinBox) => void;
  onshow: (this: IWinBox) => void;

  mount(src?: Element): IWinBox;

  unmount(dest?: Element): IWinBox;

  setTitle(title: string): IWinBox;

  setIcon(url: string): IWinBox;

  setBackground(background: string): IWinBox;

  setUrl(url: string): IWinBox;

  focus(state?: boolean): IWinBox;

  blur(state?: boolean): IWinBox;

  hide(state?: boolean): IWinBox;

  show(state?: boolean): IWinBox;

  minimize(state?: boolean): IWinBox;

  restore(): IWinBox;

  maximize(state?: boolean): IWinBox;

  fullscreen(state?: boolean): IWinBox;

  close(force?: boolean, ...args: any[]): boolean | undefined;

  move(x?: string | number, y?: string | number, skipUpdate?: boolean): IWinBox;

  resize(w?: string | number, h?: string | number, skipUpdate?: boolean): IWinBox;

  fit(): IWinBox;

  lock(x?: 'center', y?: 'center'): IWinBox;

  addControl(control: WinBoxControlType): IWinBox;

  removeControl(classname: string): IWinBox;

  addClass(classname: string): IWinBox;

  removeClass(classname: string): IWinBox;

  hasClass(classname: string): boolean;

  toggleClass(classname: string): IWinBox;
}

export interface WinBoxControlType {
  class?: string;
  image?: string;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  click?: Function;
  index?: number;
}
