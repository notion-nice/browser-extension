import { Tabs, TabsContent, TabsList, TabsTrigger } from "~components/ui/tabs"

import { Converter } from "./Converter"

export const Panel = () => {
  return (
    <Tabs
      defaultValue="toc"
      className="nf-w-full nf-flex nf-flex-col nf-h-full nf-overflow-hidden">
      <TabsList className="nf-grid nf-w-full nf-grid-cols-2">
        <TabsTrigger value="toc">TOC</TabsTrigger>
        <TabsTrigger value="converter">Converter</TabsTrigger>
      </TabsList>
      <div className="nf-flex-1 nf-overflow-hidden">
        <TabsContent
          value="toc"
          className="nf-w-full nf-h-full nf-overflow-hidden">
          Make changes to your toc here.
        </TabsContent>
        <TabsContent
          value="converter"
          className="nf-w-full nf-h-full nf-overflow-hidden">
          <Converter />
        </TabsContent>
      </div>
    </Tabs>
  )
}
