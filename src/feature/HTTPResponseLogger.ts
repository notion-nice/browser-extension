export const httpResponseLogger = (
  cb: (input: RequestInfo, init?: RequestInit) => void
) => {
  const { fetch: originalFetch } = window
  window.fetch = async function (input: RequestInfo, init?: RequestInit) {
    cb(input, init)
    const ret = await originalFetch(input, init)
    return ret
  }.bind(window.fetch)
}
