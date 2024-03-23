import { useMount } from "ahooks"
import React, { useState } from "react"

import { getBaseInfo, type ComboInfo } from "~lib/stripe"
import { generatePaymentUrl, getComboPrice, getUserInfo } from "~utils/notion"

import { Button } from "./ui/button"
import { Dialog, DialogContent, type DialogContentProps } from "./ui/dialog"
import { useToast } from "./ui/use-toast"

type UpgradeProps = Pick<DialogContentProps, "portalProps"> & {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const Upgrade = ({ open, portalProps, onOpenChange }: UpgradeProps) => {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [comboList, setComboList] = useState<ComboInfo[]>([])

  const generateComboList = async () => {
    const user = await getUserInfo()
    const { comboMap } = await getBaseInfo()
    const plusInfo: ComboInfo = { ...comboMap.plus }
    const isPlus = user.metadata?.plan_type === "plus"
    plusInfo.price = await getComboPrice()
    plusInfo.btnProps.onClick = () => {
      setLoading(true)
      generatePaymentUrl()
        .then((paymentUrl) => {
          window.location.href = paymentUrl
        })
        .catch((error) => {
          generateComboList()
          toast({ variant: "destructive", description: error.message })
        })
        .finally(() => {
          setLoading(false)
        })
    }

    if (isPlus) {
      plusInfo.btnText = "你当前的套餐"
      plusInfo.btnProps = {
        variant: "default",
        disabled: true
      }

      setComboList([plusInfo, comboMap.pro])
      return
    }
    setComboList([comboMap.free, plusInfo])
  }

  useMount(generateComboList)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="!nf-w-[640px] !nf-p-0 !nf-gap-0"
        portalProps={portalProps}>
        <div className="nf-flex nf-w-full nf-flex-row nf-items-center nf-justify-between nf-border-b nf-px-8 nf-py-6 ">
          <span className="nf-text-xl nf-font-medium">您的套餐</span>
        </div>
        <div className="nf-flex nf-flex-col md:nf-flex-row">
          {comboList.map((combo, inx) => (
            <div
              key={inx}
              className="nf-text-sm nf-relative nf-flex-1 nf-flex nf-gap-5 nf-flex-col nf-border-t nf-py-4 nf-px-6 md:nf-border-r last:nf-border-r-0 md:nf-border-t-0 md:nf-max-w-xs">
              <div className="nf-relative nf-flex nf-flex-col">
                <div className="nf-flex nf-flex-col nf-gap-1">
                  <p className="nf-flex nf-items-center nf-gap-2 nf-text-xl nf-font-medium">
                    {combo.icon}
                    {combo.label}
                  </p>
                  <div className="nf-flex nf-items-baseline nf-gap-[6px]">
                    <p className="nf-text-base nf-font-light nf-text-foreground">
                      每年 HK${combo.price}
                    </p>
                  </div>
                </div>
              </div>
              <div className="nf-relative nf-flex nf-flex-col">
                <Button {...combo.btnProps} loading={loading}>
                  {combo.btnText}
                </Button>
              </div>
              <div className="nf-flex nf-flex-col nf-flex-grow nf-gap-2">
                <div className="nf-relative nf-flex nf-flex-col">
                  <p className="nf-font-medium">{combo.description}</p>
                </div>
                {combo.featureList.map((feature) => (
                  <div key={feature} className="nf-relative">
                    <div className="nf-flex nf-justify-start nf-gap-2">
                      <div className="nf-w-8 nf-flex-shrink-0">
                        <svg
                          stroke="currentColor"
                          fill="none"
                          stroke-width="2"
                          viewBox="0 0 24 24"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="nf-mr-2 nf-mt-1 nf-h-4 nf-w-4"
                          height="1em"
                          width="1em"
                          xmlns="http://www.w3.org/2000/svg">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <span>{feature}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="relative flex flex-col nf-bg-primary text-xs text-token-text-secondary">
                {!!combo.hint?.length &&
                  combo.hint.map((hint, key) => (
                    <div key={key}>
                      <a
                        target="_blank"
                        className="font-medium underline"
                        href={hint.href}>
                        {hint.label}
                      </a>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
