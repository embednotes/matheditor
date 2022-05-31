import { Cursor } from "./cursor";
import { DoubleChildMathNode, SingleChildMathNode, MathNode, MathExpression } from "./math";

export class Fraction extends DoubleChildMathNode {
    renderAsLaTeX(cursor: Cursor): string {
        let numerator = this.children[0].renderAsLaTeX(cursor);
        let denominator = this.children[1].renderAsLaTeX(cursor);
        return this.getHTMLPrefix() + `{\\frac{${numerator}}{${denominator}}}`;
    }
}

export class IntegralType extends DoubleChildMathNode {
    commandName: string;

    constructor(commandName: string) {
        super();
        this.commandName = commandName;
    }

    renderAsLaTeX(cursor: Cursor): string {
        let upper = this.children[0].renderAsLaTeX(cursor);
        let lower = this.children[1].renderAsLaTeX(cursor);
        return this.getHTMLPrefix() + `{\\displaystyle\\${this.commandName}_{${lower}}^{${upper}}}`;
    }
}

export class EvaluatedFrom extends DoubleChildMathNode {
    renderAsLaTeX(cursor: Cursor): string {
        let upper = this.children[0].renderAsLaTeX(cursor);
        let lower = this.children[1].renderAsLaTeX(cursor);
        return this.getHTMLPrefix() + `{\\displaystyle{\\Large\\vert}_{${lower}}^{${upper}}}`;
    }
}

export class Sum extends DoubleChildMathNode {
    renderAsLaTeX(cursor: Cursor): string {
        let upper = this.children[0].renderAsLaTeX(cursor);
        let lower = this.children[1].renderAsLaTeX(cursor);
        return this.getHTMLPrefix() + `{\\displaystyle\\sum_{${lower}}^{${upper}}}`;
    }
}

export class Product extends DoubleChildMathNode {
    renderAsLaTeX(cursor: Cursor): string {
        let upper = this.children[0].renderAsLaTeX(cursor);
        let lower = this.children[1].renderAsLaTeX(cursor);
        return this.getHTMLPrefix() + `{\\displaystyle\\prod_{${lower}}^{${upper}}}`;
    }
}

export class BigUnion extends DoubleChildMathNode {
    renderAsLaTeX(cursor: Cursor): string {
        let upper = this.children[0].renderAsLaTeX(cursor);
        let lower = this.children[1].renderAsLaTeX(cursor);
        return this.getHTMLPrefix() + `{\\displaystyle\\bigcup_{${lower}}^{${upper}}}`;
    }
}

export class BigIntersection extends DoubleChildMathNode {
    renderAsLaTeX(cursor: Cursor): string {
        let upper = this.children[0].renderAsLaTeX(cursor);
        let lower = this.children[1].renderAsLaTeX(cursor);
        return this.getHTMLPrefix() + `{\\displaystyle\\bigcap_{${lower}}^{${upper}}}`;
    }
}

/**
 * Represents functions such as "sup", "inf", "min", "max", etc. that have a subscript expression
 */
export class SubscriptableFunction extends SingleChildMathNode {
    functionName: string;

    constructor(name: string) {
        super();
        this.functionName = name;
    }

    renderAsLaTeX(cursor: Cursor): string {
        return (
            this.getHTMLPrefix() +
            `{\\displaystyle\\${this.functionName}_{${this.children[0].renderAsLaTeX(cursor)}}}`
        );
    }
}

export class CommandEnclosable extends SingleChildMathNode {
    command: string;

    constructor(command: string) {
        super();
        this.command = command;
    }

    renderAsLaTeX(cursor: Cursor): string {
        let content = this.children[0].renderAsLaTeX(cursor);
        return this.getHTMLPrefix() + `{${this.command}{${content}}}`;
    }
}

export class Limit extends SingleChildMathNode {
    renderAsLaTeX(cursor: Cursor): string {
        return (
            this.getHTMLPrefix() +
            `{\\displaystyle\\lim_{${this.children[0].renderAsLaTeX(cursor)}}}`
        );
    }
}

export class Bracket extends SingleChildMathNode {
    opening: string;
    closing: string;
    constructor(opening: string, closing: string) {
        super();
        this.opening = opening;
        this.closing = closing;
    }

    renderAsLaTeX(cursor: Cursor): string {
        return (
            this.getHTMLPrefix() +
            `{\\kern-0.1em\\left${this.opening}${this.children[0].renderAsLaTeX(cursor)}\\right${
                this.closing
            }}`
        );
    }
}

export class Superscript extends MathNode {
    constructor() {
        super();
        this.children = [new MathExpression()];
    }

    renderAsLaTeX(cursor: Cursor): string {
        return this.getHTMLPrefix() + `{{}^{${this.children[0].renderAsLaTeX(cursor)}}}`;
    }
}

export class Subscript extends MathNode {
    constructor() {
        super();
        this.children = [new MathExpression()];
    }

    renderAsLaTeX(cursor: Cursor): string {
        return this.getHTMLPrefix() + `{{}_{${this.children[0].renderAsLaTeX(cursor)}}}`;
    }
}
