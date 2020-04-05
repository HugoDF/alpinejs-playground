function reflect() {
  const INDENT = "\n  ";
  const ignore = (el) => {
    return el.dataset.hasOwnProperty("reflectIgnore") || el.tagName === "BR";
  };
  return {
    showClass: false,
    toggleShowClass() {
      this.showClass = !this.showClass;
    },
    content() {
      return this.recurse(
        document.querySelector("[data-reflect-root]") || document.body
      );
    },
    recurse(el) {
      if (ignore(el)) {
        return "";
      }
      if (el.children.length === 0) {
        return this.wrap(el, el.innerHTML);
      }
      return this.wrap(
        el,
        [...el.children]
          .map((el) => this.recurse(el))
          .filter(Boolean)
          .join(INDENT)
      );
    },
    wrap(el, content) {
      const tagName = el.tagName.toLowerCase();
      const attributes = [...el.attributes]
        .filter(({ name }) => {
          if (name === "class" && !this.showClass) {
            return false;
          }
          return true;
        })
        .map(({ name, value }) => `${name}="${value}"`)
        .join(" ");
      return [
        `<${tagName}${attributes ? " " + attributes : ""}>`,
        content,
        `</${tagName}>`,
      ].join(INDENT);
    },
  };
}
