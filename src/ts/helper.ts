type EventTargetElement = Window | Document | HTMLElement | Element;
type EventHandler = (event: Event) => void;
type EventListenerOptions = AddEventListenerOptions | boolean;

/**
 * Add an event listener to a DOM element
 * @param node - The target element to add the event listener to
 * @param event - The event name to listen for
 * @param fn - The callback function
 * @param opt - Optional event listener options
 */
export function addListener(
  node: EventTargetElement | null,
  event: string,
  fn: EventHandler,
  opt?: EventListenerOptions
): void {
  node?.addEventListener(event, fn, opt || false);
}

/**
 * Remove an event listener from a DOM element
 * @param node - The target element to remove the event listener from
 * @param event - The event name
 * @param fn - The callback function to remove
 * @param opt - Optional event listener options
 */
export function removeListener(
  node: EventTargetElement | null,
  event: string,
  fn: EventHandler,
  opt?: EventListenerOptions
): void {
  node?.removeEventListener(event, fn, opt || false);
}

/**
 * Prevent default behavior and stop event propagation
 * @param event - The event object
 * @param prevent - Whether to prevent default behavior
 */
export function preventEvent(event: Event, prevent = false): void {
  event.stopPropagation();
  if (prevent && event.cancelable) {
    event.preventDefault();
  }
}

/**
 * Get the first element with the specified class name
 * @param root - The root element to search within
 * @param name - The class name to search for
 * @returns The first element with the specified class name, or undefined if not found
 */
export function getByClass<T extends HTMLElement = HTMLElement>(
  root: HTMLElement | Document,
  name: string
): T | undefined {
  const elements = root.getElementsByClassName(name);
  return elements[0] as T | undefined;
}

/**
 * Add a class to an element
 * @param node - The target element
 * @param classname - The class name to add
 */
export function addClass(node: HTMLElement, classname: string): void {
  node.classList.add(classname);
}

/**
 * Check if an element has a specific class
 * @param node - The target element
 * @param classname - The class name to check for
 * @returns True if the element has the class, false otherwise
 */
export function hasClass(node: HTMLElement, classname: string): boolean {
  return node.classList.contains(classname);
}

/**
 * Remove a class from an element
 * @param node - The target element
 * @param classname - The class name to remove
 */
export function removeClass(node: HTMLElement, classname: string): void {
  node.classList.remove(classname);
}

/**
 * Set a style property on an element with caching
 * @param node - The target element
 * @param style - The CSS property name
 * @param value - The value to set
 */
export function setStyle(
  node: HTMLElement & { [key: string]: any },
  style: string,
  value: string | number
): void {
  const valueStr = String(value);
  const cacheKey = `_s_${style}`;

  if (node[cacheKey] !== valueStr) {
    node.style.setProperty(style, valueStr);
    node[cacheKey] = valueStr;
  }
}

/**
 * Set an attribute on an element with caching
 * @param node - The target element
 * @param key - The attribute name
 * @param value - The value to set
 */
export function setAttribute(
  node: HTMLElement & { [key: string]: any },
  key: string,
  value: string | number | boolean | null
): void {
  const valueStr = String(value);
  const cacheKey = `_a_${key}`;

  if (node[cacheKey] !== valueStr) {
    if (value === null || value === false) {
      node.removeAttribute(key);
    } else {
      node.setAttribute(key, valueStr);
    }
    node[cacheKey] = valueStr;
  }
}

/**
 * Remove an attribute from an element
 * @param node - The target element
 * @param key - The attribute name to remove
 */
export function removeAttribute(node: HTMLElement & { [key: string]: any }, key: string): void {
  const cacheKey = `_a_${key}`;

  if (node[cacheKey] !== null) {
    node.removeAttribute(key);
    node[cacheKey] = null;
  }
}

/**
 * Set the text content of an element
 * @param node - The target element
 * @param value - The text content to set
 */
export function setText(node: Node, value: string | number | null): void {
  const textNode = node.firstChild;
  if (textNode) {
    textNode.nodeValue = value as string;
  } else {
    node.textContent = value as string;
  }
}

export function parse(num: number | string, base: number, center: number = 0): number {
  if (typeof num === 'string') {
    if (num === 'center') {
      num = ((base - center) / 2 + 0.5) | 0;
    } else if (num === 'right' || num === 'bottom') {
      num = base - center;
    } else {
      const value = parseFloat(num);
      const unit = '' + value !== num && num.substring(('' + value).length);

      if (unit === '%') {
        num = ((base / 100) * value + 0.5) | 0;
      } else {
        num = value;
      }
    }
  }
  return num;
}

export function clsx(...args: Array<string | undefined>) {
	var i=0, tmp, str='', len=args.length;
	for (; i < len; i++) {
		if (tmp = args[i]) {
			if (typeof tmp === 'string') {
				str += (str && ' ') + tmp;
			}
		}
	}
	return str;
}
