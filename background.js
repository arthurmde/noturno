const proxyScriptURL = "pac.js";

browser.proxy.registerProxyScript(proxyScriptURL);

// Log errors from proxy script
browser.proxy.onProxyError.addListener(error => {
  console.error(`Proxy error: ${error.message}`);
});

const proxyOnIcon = {
  "16": "data/on_16.png",
  "32": "data/on_32.png",
  "64": "data/on_64.png"
};

const proxyOffIcon = {
  "16": "data/off_16.png",
  "32": "data/off_32.png",
  "64": "data/off_64.png"
};

const proxyOnLabel = "Proxy is On - press Alt+Shift+X to turn off";
const proxyOffLabel = "Proxy is Off - press Alt+Shift+X to turn on";

var proxy = {
  enabled: false,
  host: '',
  port: ''
}

function init() {
  browser.storage.local.get()
    .then((storedSettings) => {
      if(("enabled" in storedSettings) && ("port" in storedSettings) && ("host" in storedSettings)) {
        proxy.enabled = storedSettings.enabled;
        proxy.host = storedSettings.host;
        proxy.port = storedSettings.port;
        if(proxy.enabled) {
          browser.browserAction.setIcon({path: proxyOnIcon});
          browser.browserAction.setTitle({title: proxyOnLabel});
        }
      } else if(!("enabled" in storedSettings) && !("port" in storedSettings) && !("host" in storedSettings)) {
        saveProxyConfig();
      }
      browser.runtime.sendMessage(proxy, {toProxyScript: true});
    });
}

function getProxyConfig() {
  browser.storage.local.get()
    .then((storedSettings) => {
      proxy.enabled = storedSettings.enabled;
      proxy.host = storedSettings.host;
      proxy.port = storedSettings.port;
      browser.runtime.sendMessage(proxy, {toProxyScript: true});
    });
}

function saveProxyConfig() {
    browser.storage.local.set(proxy);
}

init();

function toggleProxyConfig() {
  if(!proxy.enabled) {
    proxy.enabled = true;
    // TODO: Only proxy.enabled should be saved here
    browser.storage.local.set(proxy);
    browser.runtime.sendMessage(proxy, {toProxyScript: true});
    browser.browserAction.setIcon({path: proxyOnIcon});
    browser.browserAction.setTitle({title: proxyOnLabel});
  }
  else {
    proxy.enabled = false;
    // TODO: Only proxy.enabled should be saved here
    browser.storage.local.set(proxy);
    browser.runtime.sendMessage(proxy, {toProxyScript: true});
    browser.browserAction.setIcon({path: proxyOffIcon});
    browser.browserAction.setTitle({title: proxyOffLabel});
  }
}

browser.commands.onCommand.addListener(function(command) {
  if (command == "toggle-status") {
    // This message makes the popup toggle the switch when open
    browser.runtime.sendMessage('toggle-switch');
    toggleProxyConfig();
  }
});

function handleMessage(message, sender) {
  // only handle messages from the proxy script
  if (sender.url !=  browser.extension.getURL(proxyScriptURL)) {
    return;
  }

  console.log(message);
}

browser.runtime.onMessage.addListener(handleMessage);
