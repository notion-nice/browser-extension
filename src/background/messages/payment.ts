import type { PlasmoMessaging } from "@plasmohq/messaging"

import { stripeFetch } from "~utils/stripe"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const ret = await stripeFetch.post(`/payment/${req.body.userId}`)

    res.send(ret)
  } catch (error) {
    res.send({ ok: false, error: error.message })
  }
}

export default handler
