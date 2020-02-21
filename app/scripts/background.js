this.browser = this.browser || this.chrome;

try {
  browser.contextMenus.create({
      id: "textie-text-link",
      title: "Get text link",
      contexts: ["selection"],
  });
} catch (e) {
  console.error("Error creating context menu: " + e);
}

browser.browserAction.onClicked.addListener(function (tab) {
  executeFunctionCall(tab.id, getTextSelection).then(text => {
    invokeTextSelection(text, tab);
  });
});

browser.contextMenus.onClicked.addListener(function(info, tab) {
  switch (info.menuItemId) {
    case "textie-text-link":
      invokeTextSelection(info.selectionText, tab);
      break;
  }
});

function createHashFromText(text) {
  return ":~:text=" + encodeURIComponent(text);
}

function getTextSelection() {
  return window.getSelection().toString();
}

function navigate(uri) {
  console.log('navigating ' + location.href + ' to ' + uri);
  location.href = uri;
  location.reload();
}

function makeFunctionCallString(fn, params) {
  let result = "(" + fn.toString() + ")("
    + (params || []).map(param => JSON.stringify(param)).join(", ")
    + ")";

  return result;
}

function Deferral() {
  this.resolve = null;
  this.reject = null;
  this.promise = new Promise(
    resolve => { this.resolve = resolve },
    reject => { this.reject = reject });
}

function executeFunctionCall(tabId, fn, params) {
  const code = makeFunctionCallString(fn, params);
  console.log("executing " + code);
  const deferral = new Deferral();
  browser.tabs.executeScript(tabId, { code }, deferral.resolve);
  return deferral.promise;
}

function invokeTextSelection(selectionText, tab) {
  const newUrl = new URL(tab.url);
  newUrl.hash = createHashFromText(selectionText);
  console.log("starting update " + tab.id + " to " + newUrl.href);

  browser.tabs.update(tab.id, { url: newUrl.href, active: true }, tab => { 
    console.log("update finished " + tab.id + " to " + tab.url);
    if (tab.url !== newUrl.href) {
      console.log("update failed. try executeScript");
      executeFunctionCall(tab.id, navigate, [newUrl.href]);
    }
  });
}