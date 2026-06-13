/* QUICKSOLVE PLATINUM - UNIVERSAL MATH CORE v18.2
   Status: GOD TIER (FINAL LOCK)
   Fixes:
   - ceil / floor / round syntax error
   - safe constant e handling
   - rt (y√x) priority
   - mod stability
   - NO API / NAME CHANGES
*/

window.MathCore = {
    // --- 1. Internal Math Functions ---
    fact: function(n) {
        if (n < 0 || n > 170) return NaN;
        if (n % 1 !== 0) return NaN;
        if (n === 0 || n === 1) return 1;
        let r = 1;
        for (let i = 2; i <= n; i++) r *= i;
        return r;
    },

    nCr: function(n, r) {
        if (r < 0 || r > n) return NaN;
        return this.fact(n) / (this.fact(r) * this.fact(n - r));
    },

    nPr: function(n, r) {
        if (r < 0 || r > n) return NaN;
        return this.fact(n) / this.fact(n - r);
    },

    // y√x  →  x^(1/y)
    rt: function(y, x) {
        return Math.pow(x, 1 / y);
    },

    // --- 2. Solver ---
    solve: function(expr, isDeg) {
        try {
            if (!expr) return "0";

            // A. Auto-close brackets
            let o = (expr.match(/\(/g) || []).length;
            let c = (expr.match(/\)/g) || []).length;
            while (o > c) { expr += ")"; c++; }

            // B. Decimal safety
            if (expr.startsWith('.')) expr = '0' + expr;
            expr = expr.replace(/([+\-*/^(\[,])\./g, '$10.');

            // C. EARLY bind ceil / floor / round
            expr = expr.replace(/ceil\s*\(/g, "Math.ceil(");
            expr = expr.replace(/floor\s*\(/g, "Math.floor(");
            expr = expr.replace(/round\s*\(/g, "Math.round(");

            // D. Symbol mapping (SAFE)
            let s = expr
                .replace(/×/g, "*")
                .replace(/÷/g, "/")
                .replace(/−/g, "-")
                .replace(/π/g, "Math.PI")
                .replace(/\be\b/g, "Math.E"); // 🔒 critical fix

            // E. mod → %
            s = s.replace(/mod/g, "%");

            // F. yrt(x) priority (before implicit multiplication)
            s = s.replace(
                /(\d+(\.\d+)?|\)|Math\.PI|Math\.E)\s*rt\s*\(/g,
                "MathCore.rt($1,"
            );

            // G. Implicit multiplication
            s = s.replace(
                /(\d|\))(?=sin|cos|tan|asin|acos|atan|log|ln|sqrt|abs|Math\.PI|Math\.E|\()/g,
                '$1*'
            );

            // H. Other math
            s = s.replace(/(\d+(\.\d+)?|Math\.PI|Math\.E|\([^()]*\))!/g, "MathCore.fact($1)");
            s = s.replace(/(\d+(\.\d+)?)nCr(\d+(\.\d+)?)/g, "MathCore.nCr($1,$3)");
            s = s.replace(/(\d+(\.\d+)?)nPr(\d+(\.\d+)?)/g, "MathCore.nPr($1,$3)");

            // I. Power (right-to-left)
            while (s.includes('^')) {
                s = s.replace(
                    /([0-9\.]+|Math\.[A-Z]+|MathCore\.[a-zA-Z]+\([^)]*\)|[a-z]+\([^)]*\)|\([^)]*\))\^/g,
                    "($1)**"
                );
                if (s.includes('^') && !s.includes(')**')) {
                    s = s.replace(/\^/g, "**");
                }
            }

            // J. Context
            const toRad = x => isDeg ? x * Math.PI / 180 : x;
            const fromRad = x => isDeg ? x * 180 / Math.PI : x;

            const context = {
                sin: x => Math.sin(toRad(x)),
                cos: x => Math.cos(toRad(x)),
                tan: x => {
                    if (isDeg && Math.abs(x % 180) === 90) return Infinity;
                    return Math.tan(toRad(x));
                },
                asin: x => fromRad(Math.asin(x)),
                acos: x => fromRad(Math.acos(x)),
                atan: x => fromRad(Math.atan(x)),
                log: x => Math.log10(x),
                ln: x => Math.log(x),
                sqrt: x => Math.sqrt(x),
                abs: x => Math.abs(x),
                MathCore: this
            };

            const fn = new Function(...Object.keys(context), `return ${s};`);
            let res = fn(...Object.values(context));

            if (isNaN(res)) return "Error";
            if (!isFinite(res)) return "Overflow";

            return parseFloat(res.toFixed(10));

        } catch (e) {
            console.error(e);
            return "Syntax Error";
        }
    }
};