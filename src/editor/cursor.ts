/**
 * The cursor is the most complex component of the math editor.
 */

import { MathExpression, MathNode, MathCharacter } from "./math";
import { Bracket, Fraction, Subscript, Superscript } from "./mathelements";
import { SearchMenu } from "./searchmenu";
import { KatexRenderer, ALPHANUM } from "./util";

const CURSOR_ID = "__cursor";

/**
 * Represents a reference to a child expression *within* a parent node.
 *
 * You can think of it as an element in a filepath, for instance, in a file path
 * `/home/Desktop/photos`, one example of a `CursorPathLink` would be the name `Desktop`.
 *
 * The `CursorPathLink._i` member stores where in the path it is.
 */
interface CursorPathLink {
    nodeIndex: number;
    childIndex: number;
    _i: number;
}

/**
 * A helper object used as the output of `CursorLocation.resolveLinkInfo`
 */
interface LocationInfo {
    enclosingExpression: MathExpression;
    enclosingNode: MathNode | null;
}

/**
 * Represents the location of the cursor in terms of what expression the cursor currently belongs to.
 * This object does not contain any information about where the cursor is located inside that
 * expression, only which expression it is.
 *
 * Initially, the cursor will be located in what is called the "root expression".
 * For instance, if the math editor has expression `abc`, then the root expression is
 * the expression `abc`. If the math editor has the expression `ab*sqrt(c)`, then the root
 * expression is `ab*sqrt(c)`, its nodes are `a`, `b`, `*`, and `sqrt`, and `sqrt` has a
 * sub-expression, `c`.
 */
class CursorLocation {
    private _path: CursorPathLink[];
    private _root: MathExpression;

    constructor(root: MathExpression) {
        this._root = root;
        this._path = [];
    }

    /**
     * Move the cursor into a node's child.
     * - `nodeIndex`: the index of the node to move into, defined by the current expression's
     *   node array.
     * - `childIndex`: the child index of that node to move into.
     */
    moveInto(nodeIndex: number, childIndex: number): void {
        this._path.push({
            nodeIndex: nodeIndex,
            childIndex: childIndex,
            _i: this._path.length,
        });
    }

    /**
     * Return the `CursorPathLink` object representing the parent of the passed
     * `CursorPathLink`. Using the analogy of a file path, imagining the
     * path `/home/Desktop/photos`, the method `getParent(photos)` would return `Desktop`,
     * and calling `getParent(home)` would return `null`.
     */
    getParent(link: CursorPathLink): CursorPathLink | null {
        if (link._i === 0) {
            return null;
        }
        return this._path[link._i - 1];
    }

    /**
     * Resolve the passed `CursorPathLink` object into concrete information about
     * the node and expression it represents.
     */
    resolveLinkInfo(link: CursorPathLink): LocationInfo {
        let currentExpression = this._root;
        let currentNode: MathNode | null = null;
        let i = 0;

        while (i <= link._i) {
            let nextLink = this._path[i];
            currentNode = currentExpression.getNodes()[nextLink.nodeIndex];
            currentExpression = currentNode.children[nextLink.childIndex];

            i += 1;
        }

        return {
            enclosingExpression: currentExpression,
            enclosingNode: currentNode,
        };
    }

    /**
     * Return the top-level expression enclosing the cursor. If the cursor
     * is not inside a node, return the root expression.
     */
    getEnclosingExpression(): MathExpression {
        if (!this.atRoot()) {
            let topLevelLink = this._path[this._path.length - 1];

            return this.resolveLinkInfo(topLevelLink).enclosingExpression;
        }

        return this._root;
    }

    /**
     * Return `true` if the cursor is located inside the root expression.
     * For instance, let `I` be the cursor. Consider the math editor
     * expression `ab*sqrt(c)`. If we have `abI*sqrt(c)` or `ab*sqrt(c)I`, then
     * the `atRoot` will return `true`. IF we have `ab*sqrt(cI)`, then `atRoot` will return `false`.
     */
    atRoot(): boolean {
        return this._path.length === 0;
    }

    /**
     * If the cursor is not at the root, return the link representing the
     * enclosing node and child expression where the cursor lives. If the cursor
     * is located within nested nodes, return the most nested one.
     */
    getTopLevelLink(): CursorPathLink {
        if (!this.atRoot()) {
            return this._path[this._path.length - 1];
        }

        throw new Error("Cannot get top level cursor path link; stack is empty");
    }

    /**
     * Has the effect of moving the cursor out of the current enclosing node
     * and child expression. **Warning**: if this method is called by
     * `Cursor`, the `_cursorIndex` member must also be changed.
     */
    pop(): CursorPathLink {
        if (this.atRoot()) {
            throw new Error("Cannot pop cursor path link off stack; stack is empty");
        }

        return this._path.pop()!;
    }
}

/**
 * Represents not only the cursor itself but also acts as an interface
 * between the math editor objects and its actual implementation in the DOM.
 */
export class Cursor {
    private _location: CursorLocation;
    /**
     * The index of the cursor inside its current expression (defined by `this._location`)
     */
    private _cursorIndex: number;
    private _onUpdateCallbacks: (() => void)[];
    private _onRequestFocusCallbacks: (() => void)[];
    private _blinkState: boolean;
    private _lastBlinkInterrupt: number;
    private _focused: boolean;
    readonly root: MathExpression;

    searchMenu: SearchMenu;

    constructor(root: MathExpression, katexRenderFunction: KatexRenderer) {
        this._cursorIndex = 0;
        this._location = new CursorLocation(root);
        this._onUpdateCallbacks = [];
        this._onRequestFocusCallbacks = [];
        this.root = root;
        this.searchMenu = new SearchMenu(katexRenderFunction, this);
        this._blinkState = true;
        this._focused = false;

        this.searchMenu.populate();
        this._lastBlinkInterrupt = 0;

        setInterval(() => {
            if (Date.now() - this._lastBlinkInterrupt < 500) return;
            this._blinkState = !this._blinkState;
            this.notifyUpdates();
        }, 700);
    }

    /**
     * Should be called whenever the math editor is selected or gains focus
     */
    focus() {
        this._focused = true;
        this._blinkState = true;
        this._lastBlinkInterrupt = Date.now();
        this.notifyUpdates();
    }

    /**
     * Should be called whenever the math editor is deselected or loses focus
     */
    blur() {
        this._focused = false;
        this.notifyUpdates();
    }

    /**
     * Render the cursor itself as a KaTeX string.
     */
    renderAsLatex(): string {
        if (!this._focused) {
            return "";
        }
        return `\\!\\htmlId{${CURSOR_ID}}{\\textcolor{${this._blinkState ? "black" : "white"}}{|}}`;
    }

    /**
     * Re
     */
    enterNode(nodeIndex: number, childIndex: number, direction: "left" | "right") {
        this._location.moveInto(nodeIndex, childIndex);
        if (direction === "right") {
            this._cursorIndex = 0;
        } else {
            this._cursorIndex = this.getEnclosingExpression().getNodes().length;
        }
        this.notifyUpdates();
    }

    /**
     * Return a link to the node we just left
     */
    leaveNode(direction: "left" | "right"): CursorPathLink {
        let link = this._location.pop();

        if (direction === "left") {
            this._cursorIndex = link.nodeIndex;
        } else {
            this._cursorIndex = link.nodeIndex + 1;
        }
        this.notifyUpdates();
        return link;
    }

    getCursorIndex(): number {
        return this._cursorIndex;
    }

    mouseClickCallback(event: MouseEvent, nodeID: string): void {
        console.log("clicked on", nodeID);
    }

    insertCharacterAtCursor(character: string): void {
        this._location
            .getEnclosingExpression()
            .insertNode(this._cursorIndex, new MathCharacter(character));
        this._cursorIndex += 1;
        this.notifyUpdates();
    }

    /**
     * Return the index of the new node inserted
     */
    insertNodeAtCursor(node: MathNode): number {
        this._location.getEnclosingExpression().insertNode(this._cursorIndex, node);
        this._cursorIndex += 1;
        this.notifyUpdates();
        return this._cursorIndex - 1;
    }

    deleteCharacterAtCursor(): void {
        this._location.getEnclosingExpression().removeNthNode(this._cursorIndex - 1);
        this._cursorIndex -= 1;
        this.notifyUpdates();
    }

    removeEnclosingNode(): void {
        if (this._location.atRoot()) {
            throw new Error("No enclosing node to remove");
        }
        let link = this._location.pop();
        this.getEnclosingExpression().removeNthNode(link.nodeIndex);
        this._cursorIndex = link.nodeIndex;
        this.notifyUpdates();
    }

    getCursorElement(): HTMLSpanElement {
        let el = document.getElementById(CURSOR_ID);

        if (el === null) {
            throw new Error("Cursor is not being displayed!");
        }

        return el as HTMLSpanElement;
    }

    getEnclosingExpression(): MathExpression {
        return this._location.getEnclosingExpression();
    }

    moveRight(): void {
        let expression = this._location.getEnclosingExpression();

        // check if we've reached the end of the expression; if so, move out
        if (this._cursorIndex === expression.getNodes().length) {
            // only move outwards if we're not at the root
            if (!this._location.atRoot()) {
                this.leaveNode("right");
            }
        } else {
            // check if we're moving into a node
            let nextNode = expression.getNodes()[this._cursorIndex];

            if (nextNode.children.length) {
                this.enterNode(this._cursorIndex, 0, "right");
            } else {
                this._cursorIndex += 1;
            }
        }
        this.notifyUpdates();
    }

    moveLeft(): void {
        let expression = this._location.getEnclosingExpression();

        // check if we've reached the start of the expression; if so, move out
        if (this._cursorIndex === 0) {
            // only move outwards if we're not at the root
            if (!this._location.atRoot()) {
                this.leaveNode("left");
            }
        } else {
            // check if we're moving into a node
            let previousNode = expression.getNodes()[this._cursorIndex - 1];

            if (previousNode.children.length) {
                this.enterNode(this._cursorIndex - 1, 0, "left");
            } else {
                this._cursorIndex -= 1;
            }
        }
        this.notifyUpdates();
    }

    moveDown(): void {
        if (!this._location.atRoot()) {
            let link = this._location.getTopLevelLink();
            console.log(link);
            let enclosingNode = this._location.resolveLinkInfo(link).enclosingNode!;
            let currentChildIndex = link.childIndex;

            if (currentChildIndex < enclosingNode.children.length - 1) {
                // increment child index
                this.leaveNode("left");
                this.enterNode(link.nodeIndex, currentChildIndex + 1, "left");
            }
        }
    }

    moveUp(): void {
        if (!this._location.atRoot()) {
            let link = this._location.getTopLevelLink();
            let enclosingNode = this._location.resolveLinkInfo(link).enclosingNode!;
            let currentChildIndex = link.childIndex;

            if (currentChildIndex > 0) {
                // decrement child index
                this.leaveNode("left");
                this.enterNode(link.nodeIndex, currentChildIndex - 1, "right");
            }
        }
    }

    handleKeydown(event: KeyboardEvent) {
        let key = event.key;

        this._lastBlinkInterrupt = Date.now();
        this._blinkState = true;
        this.notifyUpdates();

        if (ALPHANUM.includes(key)) {
            this.insertCharacterAtCursor(key);
        } else if ("!@#&-=+':<>,.?|".includes(key)) {
            this.insertCharacterAtCursor(key);
        } else if (key === "*") {
            this.insertCharacterAtCursor("\\cdot");
        } else if (key === "%") {
            this.insertCharacterAtCursor("\\%");
        } else if (key === "$") {
            this.insertCharacterAtCursor("\\$");
        } else if (key === " ") {
            this.insertCharacterAtCursor("~");
        } else if (key === "Backspace") {
            // check if we're at the start of the expression
            if (this._cursorIndex === 0) {
                this.removeEnclosingNode();
            } else {
                this.deleteCharacterAtCursor();
            }
        } else if (key === "\\") {
            // open up character search menu
            let cursorElement = this.getCursorElement();
            let boundingRect = cursorElement.getBoundingClientRect();
            event.preventDefault(); // Prevent a "\" from being typed in the search field
            this.searchMenu.open(boundingRect.left, boundingRect.top);
        } else if (key === "(") {
            let index = this.insertNodeAtCursor(new Bracket("(", ")"));
            this.enterNode(index, 0, "right");
        } else if (key === "{") {
            let index = this.insertNodeAtCursor(new Bracket("\\{", "\\}"));
            this.enterNode(index, 0, "right");
        } else if (key === "[") {
            let index = this.insertNodeAtCursor(new Bracket("[", "]"));
            this.enterNode(index, 0, "right");
        } else if (key === "/") {
            let index = this.insertNodeAtCursor(new Fraction());
            this.enterNode(index, 0, "right");
        } else if (key === "_") {
            let index = this.insertNodeAtCursor(new Subscript());
            this.enterNode(index, 0, "right");
        } else if (key === "^") {
            let index = this.insertNodeAtCursor(new Superscript());
            this.enterNode(index, 0, "right");
        } else if (key === "ArrowRight") {
            this.moveRight();
        } else if (key === "ArrowLeft") {
            this.moveLeft();
        } else if (key === "ArrowDown") {
            this.moveDown();
        } else if (key === "ArrowUp") {
            this.moveUp();
        }
    }

    onUpdate(callback: () => void) {
        this._onUpdateCallbacks.push(callback);
    }

    onFocusRequested(callback: () => void) {
        this._onRequestFocusCallbacks.push(callback);
    }

    notifyUpdates(): void {
        for (let cb of this._onUpdateCallbacks) {
            cb();
        }
    }

    requestFocus(): void {
        for (let cb of this._onRequestFocusCallbacks) {
            cb();
        }
    }
}
