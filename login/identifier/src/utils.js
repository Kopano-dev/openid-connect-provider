export function withClientRequestState(obj) {
  obj.state = Math.random().toString(36).substring(7);

  return obj;
}

export function dirname(s) {
  return s.replace(/\\/g,'/').replace(/\/[^/]*$/, '');
}

// TODO could be removed now?
export function propertyFromStylesheet(selector, attribute, asURL=false) {
  let value;
  let sheetHref;

  Array.prototype.some.call(document.styleSheets, function(sheet) {
    return Array.prototype.some.call(sheet.cssRules, function(rule) {
      sheetHref = sheet.href;
      if (selector === rule.selectorText) {
        return Array.prototype.some.call(rule.style, function(style) {
          if (attribute === style) {
            value = rule.style.getPropertyValue(attribute);
            return true;
          }

          return false;
        });
      }

      return false;
    });
  });

  if (value && asURL) {
    // This removes url() shit if there.
    value = value.match(/(?:\(['|"]?)(.*?)(?:['|"]?\))/)[1];
    if (!value) {
      return null;
    }
    if (sheetHref) {
      // URLs in CSS are relative to the CSS - so lets add stuff.
      const baseHref = dirname(sheetHref);
      value = baseHref + '/' + value;
    }
  }

  return value;
}

// TODO could be removed now?
export function enhanceBodyBackground() {
  const bg = propertyFromStylesheet('#bg-enhanced.enhanced', 'background-image', true);
  const overlay = propertyFromStylesheet('#bg-enhanced.enhanced::after', 'background-image', true);

  const promises = [];
  if (bg) {
    promises.push(new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        resolve();
      };
      // Set image source to whatever the url from css holds.
      img.src = bg;
    }));
  }
  if (overlay) {
    promises.push(new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        resolve();
      };
      // Set image source to whatever the url from css holds.
      img.src = overlay;
    }));
  }
  Promise.all(promises).then(() => {
    window.document.getElementById('bg-enhanced').className += ' enhanced';
  });
}
