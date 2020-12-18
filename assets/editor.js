import "alpinejs";
import lolight from "lolight";
import { tokenize } from './tokenize';
// import { zip, unzip } from "./sharing";

// /**
//  * @param {string} hash
//  * @returns {string}
//  */
// function getHtmlFromHash(hash) {
//   if (hash.length > 1) {
//     return unzip(hash.substr(1));
//   }
// }

window.preview = preview;

function preview() {
  return {
    component: null,
    snippet: null,
    copied: false,
    stripClasses: false,
    stripStyles: false,
    isEditing: false,
    setup() {
      this.component = this.$refs.demo;
      // const hashHtml = getHtmlFromHash(window.location.hash);
      // if (hashHtml) {
      //   this.component.innerHTML = hashHtml;
      // }
      this.$watch("stripClasses", this.buildSnippet.bind(this));
      this.$watch("stripStyles", this.buildSnippet.bind(this));

      // initialise
      this.buildSnippet();
    },
    buildSnippet() {
      const html = this.component.innerHTML;
      if (!html) {
        this.snippet = "No component found";
        return;
      }
      const tokens = tokenize(html);
      this.snippet = tokens.join("");
      // use refs instead of x-html in order to control `lolight` reset more easily
      this.$refs.snippet.innerHTML = this.snippet;
      // re-initialise https://larsjung.de/lolight/
      lolight.el(this.$refs.snippet);
    },
    selectSnippet(event) {
      const range = document.createRange();
      range.selectNode(event.target);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
      document.execCommand("copy");
    },
    copySnippet(event) {
      if (this.copied) return;
      window.getSelection().removeAllRanges();

      const component = this.component.cloneNode(true);

      if (this.stripClasses) {
        component.removeAttribute("class");
        component
          .querySelectorAll("[class]")
          .forEach((el) => el.removeAttribute("class"));
      }
      if (this.stripStyles) {
        component.removeAttribute("style");
        component
          .querySelectorAll("[style]")
          .forEach((el) => el.removeAttribute("style"));
      }

      event.clipboardData.setData("text/plain", component.outerHTML);

      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 2000);
    },
    toggleEdit() {
      this.stripClasses = false;
      this.stripStyles = false;
      this.isEditing = !this.isEditing;
      if (this.isEditing) {
        this.startEdit();
      } else {
        this.save();
      }
    },
    startEdit() {
      this.$refs.snippet.innerHTML = this.snippet;
    },
    save() {
      this.component.innerHTML = this.snippet;
      this.component.innerHTML = this.component.innerText;
      // const html = this.component.innerHTML;
      // window.location.hash = zip(html);
      lolight.el(this.$refs.snippet);
    },
  };
}
