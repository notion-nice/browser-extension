import { animated, useSpring } from "@react-spring/web"
import { useHover } from "@use-gesture/react"
import { theme } from "antd"
import type { CSSProperties, PropsWithChildren } from "react"
import { useRef } from "react"

const { useToken } = theme

export const MenuFold = ({ children }: PropsWithChildren) => {
  const { token } = useToken()
  const ref = useRef<HTMLButtonElement>(null)
  const isOpen = useRef(false)
  const [spring, api] = useSpring(
    () => ({
      width: 0,
      visibility: "hidden" as CSSProperties["visibility"]
    }),
    []
  )
  const [r, ra] = useSpring(() => ({
    from: {
      transform: "translateX(0px) translateY(-50%) rotate(0deg)"
    }
  }))
  const [c, ca] = useSpring(() => ({
    from: { opacity: 0.25 }
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
          ca.start({ opacity: 0.25 })
          sa.start({ transform: "translateY(0.15rem) rotate(0deg)" })
          da.start({ transform: "translateY(-0.15rem) rotate(0deg)" })
        }
        return
      }
      if (hovering) {
        ca.start({ opacity: 1 })
      } else {
        ca.start({ opacity: 0.25 })
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
      api.start({ width: 0, visibility: "hidden" })
      return
    }
    isOpen.current = true
    api.start({ width: 240, visibility: "visible" })
    ra.start({
      transform: "translateX(-240px) translateY(-50%) rotate(180deg)"
    })
    sa.start({ transform: "translateY(0.15rem) rotate(0deg)" })
    da.start({ transform: "translateY(-0.15rem) rotate(0deg)" })
  }

  return (
    <>
      <animated.div style={spring}>{children}</animated.div>
      <animated.div className="fixed right-0 top-1/2 z-40" style={r}>
        <button ref={ref} onClick={onClick}>
          <span>
            <animated.div
              className="flex h-[72px] w-8 items-center justify-center"
              style={c}>
              <div className="flex h-6 w-6 flex-col items-center">
                <animated.div
                  className="h-3 w-1 rounded-full"
                  style={{ backgroundColor: token.colorPrimary, ...s }}
                />
                <animated.div
                  className="h-3 w-1 rounded-full bg-token-text-primary"
                  style={{ backgroundColor: token.colorPrimary, ...d }}
                />
              </div>
            </animated.div>
          </span>
        </button>
      </animated.div>
    </>
  )
}
