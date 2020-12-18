import lolight from "lolight";
/**
 * @param {string} html
 * @returns {Array<string>}
 */
export function tokenize(html) {
  const rawTokens = lolight.tok(html.trim());

  const tokens = [];
  let indentDepth = 0;
  let indentations = indentDepth;
  const INDENT_NUM = 2;
  for (let i = 0; i < rawTokens.length; i++) {
    const token = rawTokens[i];

    switch (token[1]) {
      // enable toggling of `style` and `class` attributes
      // users might want just the markup (without styles)
      case this.stripStyles && "style":
      case this.stripClasses && "class": {
        // remove 'class="foo bar"' including leading/trailing whitespace
        // get rid of class="foo bar" + trailing whitespace
        let tokensToSkip = 0;
        // "=" of `class="foo bar"`
        // &&
        // "foo bar" of `class="foo bar"`, token of type "str"
        if (rawTokens[i + 1][1] === "=" && rawTokens[i + 2][0] === "str") {
          tokensToSkip += 2;
        } else {
          // class without a value, do nothing
          break;
        }
        let spaceTokenIdx = i + 3;
        while (rawTokens[spaceTokenIdx][0] === "spc") {
          tokensToSkip += 1;
          spaceTokenIdx += 1;
        }

        // see if next token after removing class is `>`
        // to get rid of leftover whitespaces
        // eg. ` class="foo bar">` should be `>` not ` >`
        if (rawTokens[i + tokensToSkip + 1][1] === ">") {
          let lastTokenIdx = tokens.length - 1;
          while (tokens[lastTokenIdx] === " ") {
            tokens.pop();
            lastTokenIdx -= 1;
          }
        }

        i += tokensToSkip;
        break;
      }
      default: {
        // If it's a return or new line
        if (/\r|\n/.exec(token[1])) {
          // The return should be first, ie strip leading spaces
          token[1] = token[1].replace(/\s+[\n|\r]$/, "");

          indentDepth = /\s/.exec(token[1]).input.length;
          // Check the length of the \r + tabs
          const length = /\r|\n/.exec(token[1]).input.length;

          token[1] = token[1].slice(0, indentDepth);

          // Replace tabs with 4 spaces
          token[1] = token[1].replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
          tokens.push(token[1]);
        } else {
          function getIndentation(depth) {
            return (Math.floor(depth / 2) + 1) * INDENT_NUM;
          }
          function makeSpaces(count) {
            return Array.from({
              length: indentations,
            })
              .map(() => " ")
              .join("");
          }
          // tokens that we want to put a newline + re-indent in front of
          if (["@", "x"].includes(token[1])) {
            indentations = getIndentation(indentDepth);
            token[1] = `\n${makeSpaces(indentations)}${token[1]}`;
          }
          // put onto newline with -2 indent if we reindented the attributes
          if (
            indentations === getIndentation(indentDepth) &&
            [">"].includes(token[1]) &&
            rawTokens[i - 2][1] !== "/"
          ) {
            indentations -= INDENT_NUM;
            token[1] = `\n${makeSpaces(indentations)}${token[1]}`;
          }

          tokens.push(
            token[1].replace(
              /[\u00A0-\u9999<>\&]/gim,
              (i) => "&#" + i.charCodeAt(0) + ";"
            )
          );
        }
      }
    }
  }

  return tokens;
}
