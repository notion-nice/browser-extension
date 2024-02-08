import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  chrome.downloads.download({ url: req.body.exportURL }, function (downloadId) {
    res.send({ downloadId })
  })
}

export default handler
