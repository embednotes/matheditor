import { Cursor } from "./cursor";
import { createElement, asRawHTML } from "./dom";
import { Fraction, IntegralType, EvaluatedFrom, Sum, Product, BigUnion, BigIntersection, SubscriptableFunction, CommandEnclosable, Limit, Bracket } from "./mathelements";
import { KatexRenderer } from "./util";

/**
 * Implements a dialog box for searching for a special characters or math elements
 * (symbols that aren't included on standard US keyboards such as `\pi` or `\sum`).
 *
 * Because of the potential difficulty in allowing the user of this module to implement
 * this menu themselves, it is entirely implemented using standard Javascript features in-module.
 */
export class SearchMenu {
    _renderFunction: KatexRenderer;
    _currentElement: HTMLElement | null;
    _registry: SearchMenuRegistry;
    _cursor: Cursor;
    _isOpen: boolean;

    constructor(katexRenderFunction: KatexRenderer, cursor: Cursor) {
        this._renderFunction = katexRenderFunction;
        this._currentElement = null;
        this._registry = new SearchMenuRegistry();
        this._cursor = cursor;
        this._isOpen = false;
    }

    addSearchMenuItem(item: MenuItem): void {
        this._registry.addItem(item);
    }

    populate() {
        let greekLetters = [
            "alpha",
            "beta",
            "gamma",
            "delta",
            "epsilon",
            "zeta",
            "eta",
            "theta",
            "iota",
            "kappa",
            "lambda",
            "mu",
            "nu",
            "xi",
            "omicron",
            "pi",
            "rho",
            "sigma", // male
            "tau",
            "upsilon",
            "phi",
            "chi",
            "psi",
            "omega",
        ];

        for (let letter of greekLetters) {
            // capitalize letter
            let displayName = letter[0].toUpperCase() + letter.slice(1);

            this._cursor.searchMenu.addSearchMenuItem({
                displayName: displayName,
                // in all cases, the LaTeX code is just the name of the letter
                displayLaTeXCode: "\\" + letter,
                onSelect: () => {
                    this._cursor.insertCharacterAtCursor("\\" + letter);
                },
            });

            // Add uppercase variant
            this._cursor.searchMenu.addSearchMenuItem({
                displayName: "Uppercase " + displayName,
                // in all cases, the LaTeX code for upper case is the name of the letter,
                // but capitalized
                displayLaTeXCode: "\\" + displayName,
                // provide user shortcut, where, for instance, "uppercase pi" can be found
                // by searching "upi".
                searchableAliases: ["u" + letter],
                onSelect: () => {
                    this._cursor.insertCharacterAtCursor("\\" + displayName);
                },
            });
        }

        // Add special "var" letters
        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Epsilon",
            displayLaTeXCode: "\\varepsilon",
            searchableAliases: ["varepsilon", "veps"],
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\varepsilon");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Kappa",
            displayLaTeXCode: "\\varkappa",
            searchableAliases: ["varkappa", "vkap"],
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\varkappa");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Phi",
            displayLaTeXCode: "\\varphi",
            searchableAliases: ["varphi", "vphi"],
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\varphi");
            },
        });

        // Other letters

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Nabla",
            displayLaTeXCode: "\\nabla",
            searchableAliases: ["gradient", "divergence", "curl"],
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\nabla");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Partial Derivative",
            displayLaTeXCode: "\\partial",
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\partial");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Imaginary Component",
            displayLaTeXCode: "\\Im",
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\Im");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Real Component",
            displayLaTeXCode: "\\Re",
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\Re");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Natural Numbers",
            displayLaTeXCode: "\\N",
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\N");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Integers",
            displayLaTeXCode: "\\Z",
            searchableAliases: ["z"],
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\Z");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Rational Numbers",
            displayLaTeXCode: "\\mathbb{Q}",
            searchableAliases: ["q"],
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\mathbb{Q}");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Real Numbers",
            displayLaTeXCode: "\\R",
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\R");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Complex Numbers",
            displayLaTeXCode: "\\Complex",
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\Complex");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Cursive L",
            displayLaTeXCode: "\\ell",
            searchableAliases: ["l"],
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\ell");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Aleph",
            displayLaTeXCode: "\\aleph",
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\aleph");
            },
        });

        // Logic

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Universal Quantifier",
            displayLaTeXCode: "\\forall",
            searchableAliases: ["forall"],
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\forall");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Existential Quantifier",
            displayLaTeXCode: "\\exists",
            searchableAliases: ["exists"],
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\exists");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Negated Existential Quantifier",
            displayLaTeXCode: "\\nexists",
            searchableAliases: ["nexists"],
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\nexists");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Subset",
            displayLaTeXCode: "\\subseteq",
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\subseteq");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Strict Subset",
            displayLaTeXCode: "\\subset",
            searchableAliases: ["subset"],
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\subset");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Superset",
            displayLaTeXCode: "\\supseteq",
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\supseteq");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Strict Superset",
            displayLaTeXCode: "\\supset",
            searchableAliases: ["supset"],
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\supset");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Logical AND",
            displayLaTeXCode: "\\land",
            searchableAliases: ["land"],
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\land");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Logical OR",
            displayLaTeXCode: "\\lor",
            searchableAliases: ["lor"],
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\lor");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Negation",
            displayLaTeXCode: "\\neg",
            searchableAliases: ["neg", "not", "logical not"],
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\neg");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Empty Set",
            displayLaTeXCode: "\\empty",
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\empty");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Empty Set",
            displayLaTeXCode: "\\varnothing",
            searchableAliases: ["varnothing"],
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\varnothing");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Therefore",
            displayLaTeXCode: "\\therefore",
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\therefore");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Because",
            displayLaTeXCode: "\\because",
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\because");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Element of",
            displayLaTeXCode: "\\in",
            searchableAliases: ["in"],
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\in");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Not an Element of",
            displayLaTeXCode: "\\notin",
            searchableAliases: ["notin"],
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\notin");
            },
        });

        // Misc

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Center Dots",
            displayLaTeXCode: "\\cdots",
            searchableAliases: ["ellipsis"],
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\cdots");
            },
        });

        // Trig and other functions

        let functions = {
            sin: "Sine",
            cos: "Cosine",
            tan: "Tangent",
            csc: "Cosecant",
            sec: "Secant",
            cot: "Cotangent",
            arccos: "Inverse Cosine",
            arcsin: "Inverse Sine",
            arctan: "Inverse Tangent",
            arccsc: "Inverse Cosecant",
            arcsec: "Inverse Secant",
            arccot: "Inverse Cotangent",
            sinh: "Hyperbolic Sine",
            cosh: "Hyperbolic Cosine",
            tanh: "Hyperbolic Tangent",
            csch: "Hyperbolic Cosecant",
            sech: "Hyperbolic Secant",
            coth: "Hyperbolic Cotangent",
            arcsinh: "Inverse Hyperbolic Sine",
            arccosh: "Inverse Hyperbolic Cosine",
            arctanh: "Inverse Hyperbolic Tangent",
            arccsch: "Inverse Hyperbolic Cosecant",
            arcsech: "Inverse Hyperbolic Secant",
            arccoth: "Inverse Hyperbolic Cotangent",
            log: "Logarithm",
            ln: "Natural Logarithm",
            adj: "Adjugate",
            arg: "Argument of",
            argmax: "Argument of Maximum",
            argmin: "Argument of Minimum",
            cov: "Covariance",
            crd: "Chord",
            deg: "Degree Function",
            det: "Determinant",
            dim: "Dimension",
            erf: "Error Function",
            exp: "Exponential Function",
            gcd: "Greatest Common Denominator",
            ker: "Kernel",
            lcm: "Least Common Multiple",
            lerp: "Linear Interpolation Function",
            mod: "Modulo Function",
            rank: "Rank",
            sgn: "Sign Function",
            Si: "Sine Integral Function",
            Ci: "Cosine Integral Function",
        };

        for (let [functionName, displayName] of Object.entries(functions)) {
            this._cursor.searchMenu.addSearchMenuItem({
                displayName: displayName,
                displayLaTeXCode: `\\operatorname{${functionName}}`,
                searchableAliases: [functionName],
                onSelect: () => {
                    this._cursor.insertCharacterAtCursor(`{\\operatorname{${functionName}}}`);
                },
            });
        }

        // Operators

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Plus/Minus",
            displayLaTeXCode: "\\pm",
            searchableAliases: ["pm"],
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\pm");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Not Equal to",
            displayLaTeXCode: "\\neq",
            searchableAliases: ["neq"],
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\neq");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Less Than or Equal to",
            displayLaTeXCode: "\\leq",
            searchableAliases: ["leq"],
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\leq");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Greater than or Equal to",
            displayLaTeXCode: "\\geq",
            searchableAliases: ["geq"],
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\geq");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Much Greater than",
            displayLaTeXCode: "\\gg",
            searchableAliases: ["gg"],
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\gg");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Much Less than",
            displayLaTeXCode: "\\ll",
            searchableAliases: ["ll"],
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\ll");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Equivalent to",
            displayLaTeXCode: "\\equiv",
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\equiv");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Congruent to",
            displayLaTeXCode: "\\cong",
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\cong");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Approximately",
            displayLaTeXCode: "\\approx",
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\approx");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Divided By",
            displayLaTeXCode: "\\div",
            searchableAliases: ["div"],
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\div");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Union",
            displayLaTeXCode: "\\cup",
            searchableAliases: ["cup"],
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\cup");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Intersection",
            displayLaTeXCode: "\\cap",
            searchableAliases: ["cap"],
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\cap");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Set Subtraction",
            displayLaTeXCode: "\\setminus",
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\setminus");
            },
        });

        // Math elements

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Fraction",
            displayLaTeXCode: "\\small\\frac{a}{b}",
            onSelect: () => {
                let index = this._cursor.insertNodeAtCursor(new Fraction());
                this._cursor.enterNode(index, 0, "right");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Integral",
            displayLaTeXCode: "\\small\\int_b^a",
            onSelect: () => {
                let index = this._cursor.insertNodeAtCursor(new IntegralType("int"));
                this._cursor.enterNode(index, 0, "right");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Double Integral",
            displayLaTeXCode: "\\small\\iint",
            searchableAliases: ["iiint"],
            onSelect: () => {
                let index = this._cursor.insertNodeAtCursor(new IntegralType("iint"));
                this._cursor.enterNode(index, 0, "right");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Triple Integral",
            displayLaTeXCode: "\\small\\iiint",
            searchableAliases: ["iiint"],
            onSelect: () => {
                let index = this._cursor.insertNodeAtCursor(new IntegralType("iiint"));
                this._cursor.enterNode(index, 0, "right");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Contour Integral",
            displayLaTeXCode: "\\tiny\\oint",
            onSelect: () => {
                let index = this._cursor.insertNodeAtCursor(new IntegralType("oint"));
                this._cursor.enterNode(index, 0, "right");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Double Contour Integral",
            displayLaTeXCode: "\\tiny\\oiint",
            searchableAliases: ["iiint"],
            onSelect: () => {
                let index = this._cursor.insertNodeAtCursor(new IntegralType("oiint"));
                this._cursor.enterNode(index, 0, "right");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Triple Contour Integral",
            displayLaTeXCode: "\\tiny\\oiiint",
            searchableAliases: ["iiint"],
            onSelect: () => {
                let index = this._cursor.insertNodeAtCursor(new IntegralType("oiiint"));
                this._cursor.enterNode(index, 0, "right");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Evaluated from",
            displayLaTeXCode: "{\\Large|}_b^a",
            onSelect: () => {
                let index = this._cursor.insertNodeAtCursor(new EvaluatedFrom());
                this._cursor.enterNode(index, 0, "right");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Summation",
            displayLaTeXCode: "\\tiny\\sum_{i=1}^{n}",
            searchableAliases: ["sigma"],
            onSelect: () => {
                let index = this._cursor.insertNodeAtCursor(new Sum());
                this._cursor.enterNode(index, 0, "right");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Product",
            displayLaTeXCode: "\\tiny\\prod_{i=1}^{n}",
            searchableAliases: ["pi"],
            onSelect: () => {
                let index = this._cursor.insertNodeAtCursor(new Product());
                this._cursor.enterNode(index, 0, "right");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Union Notation",
            displayLaTeXCode: "\\tiny\\bigcup_{i=1}^{n}",
            onSelect: () => {
                let index = this._cursor.insertNodeAtCursor(new BigUnion());
                this._cursor.enterNode(index, 0, "right");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Intersection Notation",
            displayLaTeXCode: "\\tiny\\bigcap_{i=1}^{n}",
            onSelect: () => {
                let index = this._cursor.insertNodeAtCursor(new BigIntersection());
                this._cursor.enterNode(index, 0, "right");
            },
        });

        let subscriptableFunctions = ["Infimum", "Maximum", "Minimum", "Supremum"];

        for (let funcDisplayName of subscriptableFunctions) {
            // the function name is just the firs three letters, lowercase
            // e.g. "Infimum" => "inf"
            let funcName = funcDisplayName.slice(0, 3).toLowerCase();

            this._cursor.searchMenu.addSearchMenuItem({
                displayName: funcDisplayName,
                displayLaTeXCode: `\\small\\${funcName}_{x\\in S}`,
                onSelect: () => {
                    let index = this._cursor.insertNodeAtCursor(
                        new SubscriptableFunction(funcName)
                    );
                    this._cursor.enterNode(index, 0, "right");
                },
            });

            // Add the non-subscriptable version
            this._cursor.searchMenu.addSearchMenuItem({
                displayName: funcDisplayName,
                displayLaTeXCode: `\\${funcName}`,
                onSelect: () => {
                    this._cursor.insertCharacterAtCursor("\\" + funcName);
                },
            });
        }

        // Environments

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Square Root",
            displayLaTeXCode: "\\sqrt{~}",
            searchableAliases: ["sqrt"],
            onSelect: () => {
                let index = this._cursor.insertNodeAtCursor(new CommandEnclosable("\\sqrt"));
                this._cursor.enterNode(index, 0, "right");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Cube Root",
            displayLaTeXCode: "\\sqrt[3]{~}",
            onSelect: () => {
                let index = this._cursor.insertNodeAtCursor(new CommandEnclosable("\\sqrt[3]"));
                this._cursor.enterNode(index, 0, "right");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Fourth Root",
            displayLaTeXCode: "\\sqrt[4]{~}",
            onSelect: () => {
                let index = this._cursor.insertNodeAtCursor(new CommandEnclosable("\\sqrt[4]"));
                this._cursor.enterNode(index, 0, "right");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Nth Root",
            displayLaTeXCode: "\\sqrt[n]{~}",
            onSelect: () => {
                let index = this._cursor.insertNodeAtCursor(new CommandEnclosable("\\sqrt[n]"));
                this._cursor.enterNode(index, 0, "right");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Limit",
            displayLaTeXCode: "\\lim_{x\\to a}",
            onSelect: () => {
                let index = this._cursor.insertNodeAtCursor(new Limit());
                this._cursor.enterNode(index, 0, "right");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Vector Notation",
            displayLaTeXCode: "\\vec{a}",
            onSelect: () => {
                let index = this._cursor.insertNodeAtCursor(new CommandEnclosable("\\vec"));
                this._cursor.enterNode(index, 0, "right");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Bar Notation",
            displayLaTeXCode: "\\bar{a}",
            onSelect: () => {
                let index = this._cursor.insertNodeAtCursor(new CommandEnclosable("\\bar"));
                this._cursor.enterNode(index, 0, "right");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Dot Notation",
            displayLaTeXCode: "\\dot{a}",
            onSelect: () => {
                let index = this._cursor.insertNodeAtCursor(new CommandEnclosable("\\dot"));
                this._cursor.enterNode(index, 0, "right");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Hat Notation",
            displayLaTeXCode: "\\hat{a}",
            onSelect: () => {
                let index = this._cursor.insertNodeAtCursor(new CommandEnclosable("\\hat"));
                this._cursor.enterNode(index, 0, "right");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Tilde Notation",
            displayLaTeXCode: "\\tilde{a}",
            onSelect: () => {
                let index = this._cursor.insertNodeAtCursor(new CommandEnclosable("\\tilde"));
                this._cursor.enterNode(index, 0, "right");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Cancel",
            displayLaTeXCode: "\\cancel{abc}",
            onSelect: () => {
                let index = this._cursor.insertNodeAtCursor(new CommandEnclosable("\\cancel"));
                this._cursor.enterNode(index, 0, "right");
            },
        });

        // Absolute value and norm

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Absolute Value",
            displayLaTeXCode: "|x|",
            onSelect: () => {
                let index = this._cursor.insertNodeAtCursor(new Bracket("|", "|"));
                this._cursor.enterNode(index, 0, "right");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Norm",
            displayLaTeXCode: "\\lVert\\vec{x}\\rVert",
            onSelect: () => {
                let index = this._cursor.insertNodeAtCursor(new Bracket("\\lVert", "\\rVert"));
                this._cursor.enterNode(index, 0, "right");
            },
        });

        // Mathcal and Mathscr

        let letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        for (let letter of letters) {
            this._cursor.searchMenu.addSearchMenuItem({
                displayName: "Calligraphic " + letter,
                displayLaTeXCode: `\\mathcal{${letter}}`,
                searchableAliases: ["mathcal " + letter],
                onSelect: () => {
                    this._cursor.insertCharacterAtCursor(`{\\mathcal{${letter}}}`);
                },
            });
        }

        for (let letter of letters) {
            this._cursor.searchMenu.addSearchMenuItem({
                displayName: "Script " + letter,
                displayLaTeXCode: `\\mathscr{${letter}}`,
                searchableAliases: ["mathscr " + letter],
                onSelect: () => {
                    this._cursor.insertCharacterAtCursor(`{\\mathscr{${letter}}}`);
                },
            });
        }

        // Other symbols

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Infinity",
            displayLaTeXCode: "\\infty",
            searchableAliases: ["infty"],
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\infty");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Filled Black Square",
            displayLaTeXCode: "\\blacksquare",
            searchableAliases: ["black square", "qed"],
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\blacksquare");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Circle",
            displayLaTeXCode: "\\circ",
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\circ");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Degree",
            displayLaTeXCode: "90\\degree",
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\degree");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Checkmark",
            displayLaTeXCode: "\\checkmark",
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\checkmark");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Angle",
            displayLaTeXCode: "\\angle",
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\angle");
            },
        });

        // Arrows

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Short Right Arrow",
            displayLaTeXCode: "\\to",
            searchableAliases: ["to", "approaches", "right arrow"],
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\to");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Short Left Arrow",
            displayLaTeXCode: "\\gets",
            searchableAliases: ["gets", "left arrow"],
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\gets");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Long Left Arrow",
            displayLaTeXCode: "\\longleftarrow",
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\longleftarrow");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Long Right Arrow",
            displayLaTeXCode: "\\longrightarrow",
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\longrightarrow");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Implies",
            displayLaTeXCode: "\\implies",
            searchableAliases: ["double arrow"],
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\implies");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "Implied by",
            displayLaTeXCode: "\\impliedby",
            searchableAliases: ["double arrow"],
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\impliedby");
            },
        });

        this._cursor.searchMenu.addSearchMenuItem({
            displayName: "If and Only If",
            displayLaTeXCode: "\\iff",
            onSelect: () => {
                this._cursor.insertCharacterAtCursor("\\iff");
            },
        });

        console.log("Added", this._registry.length(), "math items");
    }

    /**
     * Event listener bound when `SearchMenu` is opened; will listen
     * for click events outside the search box, and if it detects any,
     */
    listenForClickOutside(event: MouseEvent): void {
        if (this._currentElement === null) return;

        if (!event.composedPath().includes(this._currentElement)) {
            this.close();
        }
    }

    open(left: number, top: number): void {
        let searchResultsContainer = createElement("div", {
            style: {
                display: "flex",
                "flex-direction": "row",
                "flex-wrap": "wrap",
            },
        });
        let inputElement = createElement(
            "input",
            {
                placeholder: `Search`,
                style: {
                    "font-size": "10pt",
                    width: "100%",
                },
            },
            [],
            {
                input: (event) => {
                    let query = (event.target as HTMLInputElement).value;

                    // show search results

                    let resultElements: HTMLElement[] = [];
                    let searchResults = this._registry.search(query);

                    // Only return the top 12 results
                    for (let result of searchResults.slice(0, 12)) {
                        resultElements.push(
                            createElement(
                                "div",
                                {
                                    style: {
                                        display: "flex",
                                        "flex-direction": "column",
                                        "align-items": "center",
                                        width: "60px",
                                        height: "60px",
                                        "border-radius": "5px",
                                        border: "1px grey solid",
                                        padding: "5px",
                                        margin: "5px",
                                        "text-align": "center",
                                        cursor: "pointer",
                                    },
                                },
                                [
                                    asRawHTML(
                                        this._renderFunction(
                                            "\\displaystyle" + result.displayLaTeXCode
                                        )
                                    ),
                                    createElement(
                                        "span",
                                        {
                                            style: { "font-size": "8pt", opacity: "0.4" },
                                        },
                                        [result.displayName]
                                    ),
                                ],
                                {
                                    click: () => {
                                        result.onSelect();
                                        this.close();
                                    },
                                }
                            )
                        );
                    }

                    // push changes
                    searchResultsContainer.textContent = ""; // quick and dirty way of clearing the element

                    for (let result of resultElements) {
                        searchResultsContainer.appendChild(result);
                    }
                },
                keydown: (event) => {
                    // Hitting enter has the effect of automatically
                    // using the first search result
                    if (event.key === "Enter") {
                        let query = (event.target as HTMLInputElement).value;
                        let searchResults = this._registry.search(query);

                        if (searchResults.length === 0) {
                            return;
                        }

                        let bestResult = searchResults[0];
                        bestResult.onSelect();
                        this.close();
                    } else if (event.key === "Escape") {
                        this.close();
                    }
                },
            }
        );

        let popup = createElement(
            "div",
            {
                style: {
                    all: "initial",
                    position: "absolute",
                    top: top + "px",
                    left: left + "px",
                    "font-family": "sans-serif",
                    "background-color": "white",
                    width: "400px",
                    "border-radius": "5px",
                    "box-shadow": "0 2px 10px rgba(0, 0, 0, 0.3)",
                    padding: "10px",
                    "box-sizing": "border-box",
                },
            },
            [inputElement, createElement("br"), searchResultsContainer]
        );
        document.body.appendChild(popup);
        this._currentElement = popup;

        inputElement.focus();

        document.addEventListener("click", this.listenForClickOutside.bind(this));
        this._isOpen = true;
    }

    close(): void {
        if (!this._isOpen) return;
        document.removeEventListener("click", this.listenForClickOutside.bind(this));
        if (this._currentElement === null) return;
        this._currentElement.remove();
        this._cursor.requestFocus();
        this._isOpen = false;
    }
}

interface MenuItem {
    displayName: string;
    displayLaTeXCode: string;
    searchableAliases?: string[];
    onSelect: () => void;
}

/**
 * Manages searching for elements and symbols inside of `SearchMenu`.
 */
class SearchMenuRegistry {
    private _items: MenuItem[];

    constructor() {
        this._items = [];
    }

    addItem(item: MenuItem) {
        this._items.push(item);
    }

    /**
     * A simple string similarity metric for search results. Higher = more similar.
     *
     * Case insensitive.
     */
    private _stringSimilarity(query: string, to: string): number {
        query = query.toLowerCase();
        to = to.toLowerCase();

        if (to.startsWith(query)) {
            return query.length / to.length;
        }
        if (to.includes(query)) {
            return query.length / to.length / 2;
        }

        return 0;
    }

    /**
     * Return an array of `MenuItem`s that match the provided query.
     * Sorted in order of relevance
     */
    search(query: string): MenuItem[] {
        query = query.trim();

        if (query === "") {
            return [];
        }

        let results: { item: MenuItem; similarity: number }[] = [];

        for (let item of this._items) {
            let searchableNames = [item.displayName, ...(item.searchableAliases ?? [])];
            let largestSimilarityScore = Math.max(
                ...searchableNames.map((name) => this._stringSimilarity(query, name))
            );

            if (largestSimilarityScore > 0) {
                results.push({
                    item: item,
                    similarity: largestSimilarityScore,
                });
            }
        }

        // Sort in descending order
        results.sort((a, b) => b.similarity - a.similarity);

        // return just items, not similarity score
        return results.map((r) => r.item);
    }

    length(): number {
        return this._items.length;
    }
}
