import Image from "@tiptap/extension-image";

const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: "300px",
        parseHTML: (el) => el.getAttribute("width") || el.style.width,
        renderHTML: (attrs) => ({
          style: `width:${attrs.width}; height:auto; max-width: 100%;`,
        }),
      },
      height: {
        default: null,
        parseHTML: (el) => el.getAttribute("height") || el.style.height,
        renderHTML: (attrs) =>
          attrs.height ? { style: `height:${attrs.height};` } : {},
      },
      "data-width-desktop": {
        default: null,
        parseHTML: (el) => el.getAttribute("data-width-desktop"),
        renderHTML: (attrs) =>
          attrs["data-width-desktop"]
            ? { "data-width-desktop": attrs["data-width-desktop"] }
            : {},
      },
      "data-width-mobile": {
        default: null,
        parseHTML: (el) => el.getAttribute("data-width-mobile"),
        renderHTML: (attrs) =>
          attrs["data-width-mobile"]
            ? { "data-width-mobile": attrs["data-width-mobile"] }
            : {},
      },
    };
  },
});

export default ResizableImage;
