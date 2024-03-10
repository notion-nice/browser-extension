import { useMount } from "ahooks"
import axios from "axios"
import Cookies from "js-cookie"
import React, { useContext, useState } from "react"

import { getUserInfo } from "~utils/notion"

import { ThemeContext } from "./ThemeContext"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  type DialogContentProps
} from "./ui/dialog"

export const Upgrade = ({
  portalProps
}: Pick<DialogContentProps, "portalProps">) => {
  const theme = useContext(ThemeContext)
  const [paymentUrl, setPaymentUrl] = useState("")
  useMount(async () => {
    const baseURL = process.env.PLASMO_PUBLIC_STRIPE_HOST
    const axiosStripe = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json"
      }
    })
    const user = await getUserInfo()

    const { customerId } = await axiosStripe
      .post("/create-payment", {
        userId: user.id,
        email: user.email,
        name: user.name
      })
      .then((r) => r.data)

    setPaymentUrl(`${baseURL}/pay/${customerId}/`)
  })
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link">升级到Plus</Button>
      </DialogTrigger>
      <DialogContent portalProps={portalProps}>
        <DialogHeader>
          <DialogTitle>升级到Plus</DialogTitle>
          {/* <DialogDescription>升级到Plus</DialogDescription> */}
        </DialogHeader>
        <div className="nf-w-full nf-h-[460px]">
          {paymentUrl && (
            <iframe
              src={paymentUrl + theme}
              allowTransparency
              className="nf-w-full nf-h-full nf-border-none"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
