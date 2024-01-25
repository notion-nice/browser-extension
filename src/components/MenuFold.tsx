import { animated, useSpring } from "@react-spring/web"
import { useHover } from "@use-gesture/react"
import type { PropsWithChildren } from "react"
import { useRef, useState } from "react"

import { cn } from "~lib/utils"

const sidebar = {
  width: 260
}

export const MenuFold = ({ children }: PropsWithChildren) => {
  const ref = useRef<HTMLButtonElement>(null)
  const isOpen = useRef(false)
  const [spring, api] = useSpring(() => ({
    width: 0,
    onChange(result) {
      const w = result.value.width
      const root: HTMLDivElement = document.body.querySelector(
        ".notion-cursor-listener"
      )
      if (root) {
        root.style.width = `calc(100vw - ${w}px)`
      }
    }
  }))
  const [r, ra] = useSpring(() => ({
    from: {
      transform: "translateX(0px) translateY(-50%) rotate(0deg)"
    }
  }))
  const [c, ca] = useSpring(() => ({
    from: { opacity: 0.45 }
  }))
  const [s, sa] = useSpring(() => ({
    from: { transform: "translateY(0.15rem) rotate(15deg)" }
  }))
  const [d, da] = useSpring(() => ({
    from: { transform: "translateY(-0.15rem) rotate(-15deg)" }
  }))

  useHover(
    ({ hovering }) => {
      if (isOpen.current) {
        if (hovering) {
          ca.start({ opacity: 1 })
          sa.start({ transform: "translateY(0.15rem) rotate(15deg)" })
          da.start({ transform: "translateY(-0.15rem) rotate(-15deg)" })
        } else {
          ca.start({ opacity: 0.45 })
          sa.start({ transform: "translateY(0.15rem) rotate(0deg)" })
          da.start({ transform: "translateY(-0.15rem) rotate(0deg)" })
        }
        return
      }
      if (hovering) {
        ca.start({ opacity: 1 })
      } else {
        ca.start({ opacity: 0.45 })
      }
    },
    { target: ref }
  )

  const onClick = () => {
    if (isOpen.current) {
      isOpen.current = false
      ra.start({
        transform: "translateX(0px) translateY(-50%) rotate(0deg)"
      })
      sa.start({ transform: "translateY(0.15rem) rotate(15deg)" })
      da.start({ transform: "translateY(-0.15rem) rotate(-15deg)" })
      api.start({ width: 0 })
      return
    }
    isOpen.current = true
    api.start({ width: sidebar.width })
    ra.start({
      transform: `translateX(-${sidebar.width}px) translateY(-50%) rotate(180deg)`
    })
    sa.start({ transform: "translateY(0.15rem) rotate(0deg)" })
    da.start({ transform: "translateY(-0.15rem) rotate(0deg)" })
  }

  return (
    <>
      <animated.div
        className="nf-fixed nf-right-0 nf-top-0 nf-h-full nf-bg-background nf-text-foreground"
        style={spring}>
        <div
          className={"nf-p-2 nf-h-full nf-overflow-hidden"}
          style={{ width: sidebar.width }}>
          {children}
        </div>
      </animated.div>
      <animated.div
        className="nf-fixed nf-right-0 nf-top-1/2 nf-z-40"
        style={r}>
        <button ref={ref} onClick={onClick}>
          <span>
            <animated.div
              className="nf-flex nf-h-[72px] nf-w-8 nf-items-center nf-justify-center"
              style={c}>
              <div className="nf-flex nf-h-6 nf-w-6 nf-flex-col nf-items-center">
                <animated.div
                  className="nf-h-3 nf-w-1 nf-rounded-full nf-bg-primary"
                  style={s}
                />
                <animated.div
                  className="nf-h-3 nf-w-1 nf-rounded-full nf-bg-primary"
                  style={d}
                />
              </div>
            </animated.div>
          </span>
        </button>
      </animated.div>
    </>
  )
}
