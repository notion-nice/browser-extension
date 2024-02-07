import axios from "axios"

import { Button } from "~components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~components/ui/tabs"

export const Panel = () => {
  const onClick = async () => {
    const ret = await axios.post("https://www.notion.so/api/v3/enqueueTask", {
      task: {
        eventName: "exportBlock",
        request: {
          block: {
            id: "",
            spaceId: ""
          },
          recursive: false,
          exportOptions: {
            exportType: "markdown",
            timeZone: "Asia/Shanghai",
            locale: "en",
            collectionViewExportType: "currentView"
          },
          shouldExportComments: false
        }
      }
    })

    let is_task_in_progress = true;

    const taskId =  ret.data.taskId

    while (is_task_in_progress) {
      const ret = await axios.post('https://www.notion.so/api/v3/getTasks', {taskIds: [taskId]})
      const results = ret.data.results
      if (results[0].state === 'success') {
        is_task_in_progress = false;
        console.log('exportBlock',results[0].status.exportURL );
        
        // cbs.success && (await cbs.success(results[0]));
      } else if (results[0].state === 'failure') {
        is_task_in_progress = false;
        // cbs.failure && (await cbs.failure(results[0]));
      } else {
        // cbs.in_progress && (await cbs.in_progress(results[0]));
      }
    }
  }
  return (
    <Tabs defaultValue="account" className="w-full">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        Make changes to your account here.
        <Button onClick={onClick}>导出</Button>
      </TabsContent>
      <TabsContent value="password">Change your password here.</TabsContent>
    </Tabs>
  )
}
