import { Tabs, TabsContent, TabsList, TabsTrigger } from "~components/ui/tabs"

import { Converter } from "./Converter"

export const Panel = () => {
  return (
    <Tabs defaultValue="account" className="w-full">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="converter">Converter</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        Make changes to your account here.
      </TabsContent>
      <TabsContent value="converter">
        <Converter />
      </TabsContent>
    </Tabs>
  )
}
