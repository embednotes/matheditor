type ElementChild = HTMLElement | string | number | null | ElementChild[] | _RawHTML;
type EventCallback<T extends Event> = (event: T) => void;
interface EventsConfig {
    blur?: EventCallback<FocusEvent>;
    change?: EventCallback<Event>;
    click?: EventCallback<MouseEvent>;
    contextmenu?: EventCallback<MouseEvent>;
    dblclick?: EventCallback<MouseEvent>;
    focus?: EventCallback<FocusEvent>;
    input?: EventCallback<InputEvent>;
    keydown?: EventCallback<KeyboardEvent>;
    mousedown?: EventCallback<MouseEvent>;
    mouseenter?: EventCallback<MouseEvent>;
    mouseleave?: EventCallback<MouseEvent>;
    mouseover?: EventCallback<MouseEvent>;
    mouseup?: EventCallback<MouseEvent>;
}

class _RawHTML {
    content: string;
    constructor(content: string) {
        this.content = content;
    }
}

export function asRawHTML(content: string): _RawHTML {
    return new _RawHTML(content);
}

/**
 * Add a child (not necessarily an `HTMLElement` object) to a parent element
 */
function _addChild(element: Element, child: ElementChild) {
    if (child instanceof HTMLElement) {
        element.appendChild(child);
    } else if (typeof child === "string" || typeof child === "number") {
        element.appendChild(document.createTextNode(child.toString()));
    } else if (child === null) {
        // render as blank, i.e. skip it
    } else if (Array.isArray(child)) {
        for (let el of child) {
            _addChild(element, el);
        }
    } else if (child instanceof _RawHTML) {
        element.innerHTML += child.content;
    }
}

/**
 * Helper function for templating HTML elements
 */
export function createElement(
    tagName: string,
    attrs: { [k: string]: any } = {},
    children?: ElementChild[],
    events?: EventsConfig
): HTMLElement {
    let element = document.createElement(tagName);

    if (attrs) {
        for (let [attr, value] of Object.entries(attrs)) {
            if (attr === "style") {
                let styleString = "";

                for (let [cssProperty, cssValue] of Object.entries(value)) {
                    styleString += `${cssProperty}: ${cssValue}; `;
                }
                element.setAttribute("style", styleString);
            } else {
                element.setAttribute(attr, value.toString());
            }
        }
    }

    if (children) {
        for (let child of children) {
            _addChild(element, child);
        }
    }

    if (events) {
        for (let [eventName, callback] of Object.entries(events)) {
            element.addEventListener(eventName, callback);
        }
    }

    return element;
}
