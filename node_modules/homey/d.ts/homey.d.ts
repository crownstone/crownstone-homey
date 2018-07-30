/* Types */

export type CSSClass = string;
export type CSSClassMap = { [key: string]: boolean };
export type CSSSelector = string;
export type Dataset = { [key: string]: string };
export type Elements = Element[];
export type EventType = string;
export type Insertable = string | Node | NodeList;

type EventOptions = { bubbles?: boolean, cancelable?: boolean, detail?: any };
type Predicate = (element: Element) => boolean;

/* Aliases */

export const body: Element;
export const html: Element;

/* CSS */

export function addClass(element: Element, cssClass: CSSClass): boolean;
export function addClass(element: Element, ...cssClasses: CSSClass[]): boolean;
export function hasClass(element: Element, cssClass: CSSClass): boolean;
export function removeClass(element: Element, cssClass: CSSClass): boolean;
export function removeClasses(element: Element, ...cssClasses: CSSClass[]): boolean;
export function toggleClass(element: Element, cssClass: CSSClass, state?: boolean): boolean;
export function toggleClasses(element: Element, ...cssClasses: (CSSClass | CSSClassMap)[]): boolean;

/* Data */

export function dataset(element: HTMLElement): Dataset;

/* Events */

export function dispatch(target: EventTarget, eventType: EventType, detail?: any, options?: EventOptions): boolean;
export function on(target: EventTarget, eventType: EventType, listener: EventListener, useCapture?: boolean): () => void;
export function once(target: EventTarget, eventType: EventType, listener: EventListener, useCapture?: boolean): () => void;
export function delegate(target: EventTarget, selector: CSSSelector, eventType: EventType, listener: EventListener, useCapture?: boolean): () => void;

/* Manipulation */

export function after(element: Element, ...insertable: Insertable[]): void;
export function append(element: Element, ...insertable: Insertable[]): void;
export function before(element: Element, ...insertable: Insertable[]): void;
export function prepend(element: Element, ...insertable: Insertable[]): void;
export function removeAttr(element: Element, attribute: string): void;
export function remove(element: Element): boolean;
export function setAttr(element: Element, attribute: string, value: any): void;
export function setHtml(element: Element, html: string): void;
export function setText(element: Element, text: string): void;

/* Quering */

export function query(element: Element, selector: CSSSelector): Element | null;
export function queryAll(element: Element, selector: CSSSelector): Elements;

/* Traversing */

export function closest(element: Element, condition: CSSSelector | Predicate): Element | null;
export function getAttr(element: Element, attribute: string, defaultValue: string | null): string | null;
export function getHtml(element: Element): string;
export function getText(element: Element): string;
export function hasAttr(element: Element, attribute: string): boolean;
export function matches(element: Element, selector: CSSSelector): boolean;
export function parent(element: Element): Element | null;
export function parentBy(element: Element, condition: CSSSelector | Predicate): Element | null;
export function parents(element: Element): Elements;
export function parentsBy(element: Element, condition: CSSSelector | Predicate): Elements;
