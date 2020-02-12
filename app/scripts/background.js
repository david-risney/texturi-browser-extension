this.browser = this.browser || this.chrome;

// browser.runtime.onInstalled.addListener((details) => {
//   console.log('previousVersion', details.previousVersion)
// })
// 
// browser.browserAction.setBadgeText({
//   text: `'Allo`
// })
// 
// console.log(`'Allo 'Allo! Event Page for Browser Action`)

browser.contextMenus.create({
    id: "textie-text-link",
    title: "Selected text link",
    contexts: ["selection"],
});

function createHashFromText(text) {
  return ":~:text=" + encodeURIComponent(text);
}

browser.contextMenus.onClicked.addListener(function(info, tab) {
  switch (info.menuItemId) {
    case "textie-text-link": {
        browser.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
          const originalUrl = tabs[0].url;
          const newUrl = new URL(originalUrl);
          newUrl.hash = createHashFromText(info.selectedText);
          browser.tabs.update({ url: newUrl.href });
        });
      }
      break;
  }
})