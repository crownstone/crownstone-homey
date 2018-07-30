/*!
 * homey v0.1.0-beta.13
 * https://github.com/demiazz/homey
 *
 * Copyright 2017-present Alexey Plutalov <demiazz.py@gmail.com>
 * Released under the MIT license
 */

(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined"
    ? factory(exports)
    : typeof define === "function" && define.amd
      ? define("homey", ["exports"], factory)
      : factory((global.homey = {}));
})(this, function(exports) {
  "use strict";

  function hasClass(element, cssClass) {
    return element.classList.contains(cssClass);
  }

  function addClass(element, cssClass) {
    var result = !hasClass(element, cssClass);

    if (result) {
      element.classList.add(cssClass);
    }

    return result;
  }

  function addClasses(element) {
    var cssClasses = Array.prototype.slice.call(arguments, 1);

    return cssClasses.reduce(function(result, cssClass) {
      return addClass(element, cssClass) || result;
    }, false);
  }

  function drop(arrayLike, count) {
    return Array.prototype.slice.call(arrayLike, count);
  }

  function getProperty(object, property, defaultValue) {
    return Object.prototype.hasOwnProperty.call(object, property)
      ? object[property]
      : defaultValue;
  }

  function toArray(arrayLike) {
    return Array.prototype.slice.call(arrayLike);
  }

  function parent(element) {
    return element.parentElement;
  }

  function afterNode(element, parentElement, insertable) {
    parentElement.insertBefore(insertable, element.nextSibling);
  }

  function after(element) {
    var parentElement = parent(element);

    if (!parentElement) {
      throw new Error("The element has no parent");
    }

    drop(arguments, 1).reverse().forEach(function(insertable) {
      if (typeof insertable === "string") {
        element.insertAdjacentHTML("afterend", insertable);
      } else if (insertable instanceof Node) {
        afterNode(element, parentElement, insertable);
      } else {
        toArray(insertable).reverse().forEach(function(node) {
          afterNode(element, parentElement, node);
        });
      }
    });
  }

  function appendNode(element, insertable) {
    element.appendChild(insertable);
  }

  function append(element) {
    drop(arguments, 1).forEach(function(insertable) {
      if (typeof insertable === "string") {
        element.insertAdjacentHTML("beforeend", insertable);
      } else if (insertable instanceof Node) {
        appendNode(element, insertable);
      } else {
        toArray(insertable).forEach(function(node) {
          appendNode(element, node);
        });
      }
    });
  }

  function beforeNode(element, parentElement, insertable) {
    parentElement.insertBefore(insertable, element);
  }

  function before(element) {
    var parentElement = parent(element);

    if (!parentElement) {
      throw new Error("The element has no parent");
    }

    drop(arguments, 1).forEach(function(insertable) {
      if (typeof insertable === "string") {
        element.insertAdjacentHTML("beforebegin", insertable);
      } else if (insertable instanceof Node) {
        beforeNode(element, parentElement, insertable);
      } else {
        toArray(insertable).forEach(function(node) {
          beforeNode(element, parentElement, node);
        });
      }
    });
  }

  var body = window.document.body;

  function getMatchesFn() {
    var element = document.createElement("div");

    return (
      element.matches ||
      element.matchesSelector ||
      element.msMatchesSelector ||
      element.mozMatchesSelector ||
      element.webkitMatchesSelector ||
      element.oMatchesSelector
    );
  }

  var matchesFn = getMatchesFn();

  function matches(element, selector) {
    return matchesFn.call(element, selector);
  }

  function parentBy(element, condition) {
    var predicate =
      typeof condition === "string"
        ? function(e) {
            return matches(e, condition);
          }
        : condition;

    var current = parent(element);

    while (current) {
      if (predicate(current)) {
        return current;
      }

      current = parent(current);
    }

    return null;
  }

  function closestPolyfill(element, selector) {
    if (matches(element, selector)) {
      return element;
    }

    return parentBy(element, selector);
  }

  function closestNative(element, selector) {
    return element.closest(selector);
  }

  function getClosestFn() {
    var element = document.createElement("div");

    return element.closest ? closestNative : closestPolyfill;
  }

  var closestFn = getClosestFn();

  function closest(element, condition) {
    if (typeof condition === "string") {
      return closestFn(element, condition);
    }

    if (condition(element)) {
      return element;
    }

    return parentBy(element, condition);
  }

  function datasetNative(element) {
    return element.dataset;
  }

  function datasetPolyfill(element) {
    return [].slice.call(element.attributes).reduce(function(data, attribute) {
      var name = attribute.name;

      if (/^data-(.+)/.test(name)) {
        var normalizedName = name.substr(5).replace(/-\w/g, function(str) {
          return str[1].toUpperCase();
        });

        data[normalizedName] = attribute.value;
      }

      return data;
    }, {});
  }

  function getDatasetFn() {
    var element = document.createElement("div");

    return element.dataset ? datasetNative : datasetPolyfill;
  }

  var datasetFn = getDatasetFn();

  function dataset(element) {
    return datasetFn(element);
  }

  function on(target, eventType, handler) {
    var useCapture =
      arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

    target.addEventListener(eventType, handler, useCapture);

    return function() {
      return target.removeEventListener(eventType, handler, useCapture);
    };
  }

  function delegate(target, selector, eventType, handler) {
    var useCapture =
      arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

    function wrappedHandler(event) {
      if (!(event.target instanceof Element)) {
        return;
      }

      var current = event.target;

      while (current) {
        if (matches(current, selector)) {
          event.delegateTarget = target;

          handler(event);

          delete event.delegateTarget;

          return;
        }

        if (current === target) {
          return;
        }

        current = parent(current);
      }
    }

    return on(target, eventType, wrappedHandler, useCapture);
  }

  function createWithConstructor(eventType, detail, bubbles, cancelable) {
    return new CustomEvent(eventType, {
      bubbles: bubbles,
      cancelable: cancelable,
      detail: detail
    });
  }

  function createWithInit(eventType, detail, bubbles, cancelable) {
    var event = document.createEvent("CustomEvent");

    event.initCustomEvent(eventType, bubbles, cancelable, detail);

    return event;
  }

  var create =
    typeof window.CustomEvent === "function"
      ? createWithConstructor
      : createWithInit;

  function dispatch(target, eventType) {
    var detail =
      arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var options =
      arguments.length > 3 && arguments[3] !== undefined
        ? arguments[3]
        : { bubbles: true, cancelable: true };

    var bubbles = getProperty(options, "bubbles", true);
    var cancelable = getProperty(options, "cancelable", true);
    var event = create(eventType, detail, bubbles, cancelable);

    return target.dispatchEvent(event);
  }

  function hasAttr(element, attribute) {
    return element.hasAttribute(attribute);
  }

  function getAttr(element, attribute) {
    var defaultValue =
      arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    if (hasAttr(element, attribute)) {
      return element.getAttribute(attribute);
    }

    return defaultValue;
  }

  function getHtml(element) {
    return element.innerHTML;
  }

  function getText(element) {
    return element.textContent;
  }

  var html = window.document.documentElement;

  function once(target, eventType, handler) {
    var useCapture =
      arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

    function wrappedHandler(event) {
      target.removeEventListener(eventType, wrappedHandler, useCapture);

      handler(event);
    }

    return on(target, eventType, wrappedHandler, useCapture);
  }

  function parents(element) {
    var result = [];

    var current = parent(element);

    while (current) {
      result.push(current);

      current = parent(current);
    }

    return result;
  }

  function parentsBy(element, condition) {
    var predicate =
      typeof condition === "string"
        ? function(e) {
            return matches(e, condition);
          }
        : condition;

    return parents(element).filter(predicate);
  }

  function prependNode(element, insertable) {
    element.insertBefore(insertable, element.firstChild);
  }

  function prepend(element) {
    drop(arguments, 1).reverse().forEach(function(insertable) {
      if (typeof insertable === "string") {
        element.insertAdjacentHTML("afterbegin", insertable);
      } else if (insertable instanceof Node) {
        prependNode(element, insertable);
      } else {
        toArray(insertable).reverse().forEach(function(node) {
          prependNode(element, node);
        });
      }
    });
  }

  function query(element, selector) {
    return element.querySelector(selector);
  }

  function queryAll(element, selector) {
    var elements = element.querySelectorAll(selector);

    return toArray(elements);
  }

  function remove(element) {
    var parentElement = parent(element);

    if (parentElement) {
      parentElement.removeChild(element);

      return true;
    }

    return false;
  }

  function removeAttr(element, attribute) {
    element.removeAttribute(attribute);
  }

  function removeClass(element, cssClass) {
    var result = hasClass(element, cssClass);

    if (result) {
      element.classList.remove(cssClass);
    }

    return result;
  }

  function removeClasses(element) {
    var cssClasses = Array.prototype.slice.call(arguments, 1);

    return cssClasses.reduce(function(result, cssClass) {
      return removeClass(element, cssClass) || result;
    }, false);
  }

  function setAttr(element, attribute, value) {
    if (value === null) {
      removeAttr(element, attribute);
    } else {
      element.setAttribute(attribute, value);
    }
  }

  function setHtml(element, html) {
    element.innerHTML = html;
  }

  function setText(element, text) {
    element.textContent = text;
  }

  function toggleClass(element, cssClass, state) {
    var target = arguments.length === 3 ? state : !hasClass(element, cssClass);
    var toggleFn = target ? addClass : removeClass;

    return toggleFn(element, cssClass);
  }

  function toggleClassesByMap(element, cssClasses) {
    return Object.keys(cssClasses).reduce(function(result, cssClass) {
      var state = cssClasses[cssClass];

      return toggleClass(element, cssClass, state) || result;
    }, false);
  }

  function toggleClasses(element) {
    var cssClasses = Array.prototype.slice.call(arguments, 1);

    return cssClasses.reduce(function(result, cssClass) {
      var currentResult =
        typeof cssClass === "string"
          ? toggleClass(element, cssClass)
          : toggleClassesByMap(element, cssClass);

      return currentResult || result;
    }, false);
  }

  exports.addClass = addClass;
  exports.addClasses = addClasses;
  exports.after = after;
  exports.append = append;
  exports.before = before;
  exports.body = body;
  exports.closest = closest;
  exports.dataset = dataset;
  exports.delegate = delegate;
  exports.dispatch = dispatch;
  exports.getAttr = getAttr;
  exports.getHtml = getHtml;
  exports.getText = getText;
  exports.hasAttr = hasAttr;
  exports.hasClass = hasClass;
  exports.html = html;
  exports.matches = matches;
  exports.on = on;
  exports.once = once;
  exports.parent = parent;
  exports.parentBy = parentBy;
  exports.parents = parents;
  exports.parentsBy = parentsBy;
  exports.prepend = prepend;
  exports.query = query;
  exports.queryAll = queryAll;
  exports.remove = remove;
  exports.removeAttr = removeAttr;
  exports.removeClass = removeClass;
  exports.removeClasses = removeClasses;
  exports.setAttr = setAttr;
  exports.setHtml = setHtml;
  exports.setText = setText;
  exports.toggleClass = toggleClass;
  exports.toggleClasses = toggleClasses;

  Object.defineProperty(exports, "__esModule", { value: true });
});
