chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    // 收集关于卸载的反馈
    // chrome.runtime.setUninstallURL("https://example.com/extension-survey")

    // 用户第一次安装你的扩展，打开一个新的网页
    chrome.tabs.create({
      url: "https://notion-nice.com/notion-nice-converter-manual"
    })
  } else if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
    // 用户已更新你的扩展
    // 你也可以在这里打开一个新的网页，告诉用户你的扩展有哪些新特性
  }
})
