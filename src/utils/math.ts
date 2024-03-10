import juice from "juice/client"
import { AssistiveMmlHandler } from "mathjax-full/js/a11y/assistive-mml"
import { liteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor"
import { RegisterHTMLHandler } from "mathjax-full/js/handlers/html"
import { TeX } from "mathjax-full/js/input/tex"
import { AllPackages } from "mathjax-full/js/input/tex/AllPackages"
import { mathjax } from "mathjax-full/js/mathjax"
import { SVG } from "mathjax-full/js/output/svg"

function renderMath(content, documentOptions, convertOptions) {
  const adaptor = liteAdaptor()
  const handler = RegisterHTMLHandler(adaptor)
  AssistiveMmlHandler(handler)
  const mathDocument = mathjax.document(content, documentOptions)
  const html = adaptor.outerHTML(mathDocument.convert(content, convertOptions))
  const stylesheet = adaptor.outerHTML(
    documentOptions.OutputJax.styleSheet(mathDocument)
  )
  return juice(html + stylesheet)
}

export const mathToSvg = (content: string) => {
  const documentOptions = {
    InputJax: new TeX({ packages: AllPackages }),
    OutputJax: new SVG({ fontCache: "none" })
  }
  const convertOptions = {
    display: false
  }

  return renderMath(content, documentOptions, convertOptions)
}
