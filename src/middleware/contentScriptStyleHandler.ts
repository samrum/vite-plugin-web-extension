import { Connect } from "vite";
import getEtag from "etag";

// Hack in support for changing the injection location of styles
//  Needed to support HMR styles in shadow DOM rendered content
//  Also supports multiple content script shadow DOMs rendered on the same page
const contentScriptStyleHandler: Connect.NextHandleFunction = (
  req,
  res,
  next
) => {
  const _originalEnd = res.end;

  // @ts-ignore
  res.end = function end(chunk, ...otherArgs) {
    if (req.url === "/@vite/client" && typeof chunk === "string") {
      if (
        !/const sheetsMap/.test(chunk) ||
        !/document\.head\.appendChild\(style\)/.test(chunk) ||
        !/document\.head\.removeChild\(style\)/.test(chunk) ||
        !/style\.innerHTML = content/.test(chunk)
      ) {
        console.error(
          "Content script HMR style support disabled -- failed to rewrite vite client"
        );

        res.setHeader("Etag", getEtag(chunk, { weak: true }));

        // @ts-ignore
        return _originalEnd.call(this, chunk, ...otherArgs);
      }

      chunk = chunk.replace(
        "const sheetsMap",
        "const styleTargets = new Set(); const styleTargetsStyleMap = new Map(); const sheetsMap"
      );
      chunk = chunk.replace("export {", "export { addStyleTarget, ");
      chunk = chunk.replace(
        "document.head.appendChild(style)",
        "styleTargets.size ? styleTargets.forEach(target => addStyleToTarget(style, target)) : document.head.appendChild(style)"
      );
      chunk = chunk.replace(
        "document.head.removeChild(style)",
        "styleTargetsStyleMap.get(style) ? styleTargetsStyleMap.get(style).forEach(style => style.parentNode.removeChild(style)) : document.head.removeChild(style)"
      );

      const lastStyleInnerHtml = chunk.lastIndexOf("style.innerHTML = content");
      chunk =
        chunk.slice(0, lastStyleInnerHtml) +
        chunk
          .slice(lastStyleInnerHtml)
          .replace(
            "style.innerHTML = content",
            "style.innerHTML = content; styleTargetsStyleMap.get(style)?.forEach(style => style.innerHTML = content)"
          );

      chunk += `
        function addStyleTarget(newStyleTarget) {            
          for (const [, style] of sheetsMap.entries()) {
            addStyleToTarget(style, newStyleTarget, styleTargets.size !== 0);
          }

          styleTargets.add(newStyleTarget);
        }

        function addStyleToTarget(style, target, cloneStyle = true) {
          const addedStyle = cloneStyle ? style.cloneNode(true) : style;
          target.appendChild(addedStyle);

          styleTargetsStyleMap.set(style, [...(styleTargetsStyleMap.get(style) ?? []), addedStyle]);
        }
      `;

      res.setHeader("Etag", getEtag(chunk, { weak: true }));
    }

    // @ts-ignore
    return _originalEnd.call(this, chunk, ...otherArgs);
  };

  next();
};

export default contentScriptStyleHandler;
