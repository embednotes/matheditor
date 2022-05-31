/**
 * Contains definitions for objects that represent arbitrary math expressions
 */

import { Cursor } from "./cursor";
import { _provisionNewID } from "./util";

/**
 * An object representing a string of nodes. Examples:
 * - `a+b+c` where `a`, `+`, `b`, `+`, and `c` are nodes
 * - `a+sqrt(b)` where `a` and `sqrt(b)` are nodes
 */
export class MathExpression {
    private _nodes: MathNode[];

    constructor() {
        this._nodes = [];
    }

    /**
     * Returns an array of this expression's nodes, in order.
     * While this method returns a reference to the underlying node array,
     * the object(s) returned by this method and its descendants should
     * be treated as read-only.
     */
    getNodes(): MathNode[] {
        return this._nodes;
    }

    /**
     * Insert a node at the specified index.
     *
     * Example; assume `expr` is a `MathExpression` instance with nodes `[b, c, d]`:
     * ```
     * expr.insertNode(0, a); // results in [a, b, c, d]
     * expr.insertNode(4, e); // results in [a, b, c, d, e]
     * ```
     */
    insertNode(before: number, node: MathNode): void {
        this._nodes.splice(before, 0, node);
    }

    /**
     * Remove the node specified by `index`.
     */
    removeNthNode(index: number): void {
        if (index < 0 || index >= this._nodes.length) {
            throw new Error("Attempted to remove node out of bounds");
        }
        this._nodes.splice(index, 1);
    }

    renderAsLaTeX(cursor: Cursor): string {
        let renderedParts = this._nodes.map((node) => node.renderAsLaTeX(cursor));
        if (cursor.getEnclosingExpression() === this) {
            renderedParts.splice(cursor.getCursorIndex(), 0, cursor.renderAsLatex());
        }
        let rendered = renderedParts.join(" ");

        if (rendered === "") {
            return "~";
        }
        return rendered;
    }

    /**
     * To be called externally whenever the DOM is redrawn in order to reinstate
     * event listeners.
     */
    propogateEventHandlers(cursor: Cursor) {
        for (let node of this._nodes) {
            node.propogateEventHandlers(cursor);
        }
    }
}

/**
 * Any singular math "entity". A node can contain "children", which are in turn
 * math expressions. For instance, a fraction node has a "numerator" child
 * and a "denominator" child, both of which are in turn expressions.
 *
 * Examples:
 * - `sin` as in `sin x`
 * - `x` as in `sin x`
 * - `a` as in `abc`
 */
export abstract class MathNode {
    readonly id: string;
    children: MathExpression[];

    constructor() {
        this.id = _provisionNewID();
        this.children = [];
    }

    abstract renderAsLaTeX(cursor: Cursor): string;

    getElementID(): string {
        return `node-${this.id}`;
    }

    getElement(): HTMLSpanElement {
        let el = document.getElementById(this.getElementID());
        if (el === null) {
            throw new Error(`Node with id ${this.id} has not been rendered yet`);
        }
        return el as HTMLSpanElement;
    }

    getHTMLPrefix(): string {
        return `\\htmlId{${this.getElementID()}}`;
    }

    /**
     * To be called only by a parent math expression
     */
    propogateEventHandlers(cursor: Cursor) {
        this.getElement().addEventListener("click", (event) => {
            cursor.mouseClickCallback(event, this.id);
        });

        for (let child of this.children) {
            child.propogateEventHandlers(cursor);
        }
    }
}

/**
 * A node representing an atomic math symbol.
 *
 * Examples:
 * - `a` as in `abc`
 * - `+` as in `a+b`
 * - `sin` as in `sin(x)`
 */
export class MathCharacter extends MathNode {
    character: string;

    constructor(character: string) {
        super();
        this.character = character;
    }

    renderAsLaTeX(cursor: Cursor): string {
        return this.getHTMLPrefix() + this.character;
    }
}

/**
 * A node with a single child
 *
 * Examples:
 * - `lim_{x -> a}` where `{x -> a}` is its child and `lim` is the node itself
 */
export abstract class SingleChildMathNode extends MathNode {
    constructor() {
        super();
        this.children = [new MathExpression()];
    }
}

/**
 * A node with two children
 *
 * Examples:
 * - `int^a_b` where `a` and `b` are the two children and `int` is the node itself
 */
export abstract class DoubleChildMathNode extends MathNode {
    constructor() {
        super();
        this.children = [new MathExpression(), new MathExpression()];
    }
}
