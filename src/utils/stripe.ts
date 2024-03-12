const baseURL = `${process.env.PLASMO_PUBLIC_STRIPE_HOST}/api/stripe`

const _stripeFetch = async (url: string, options: any) => {
  const response = await fetch(baseURL + url, options)
  const json = await response.json()
  return json
}

export const stripeFetch = {
  post(url: string, data: any = {}, options: any = {}) {
    return _stripeFetch(url, {
      method: "POST",
      body: JSON.stringify(data),
      ...options,
      headers: {
        ...options.headers,
        "Content-Type": "application/json"
      }
    })
  }
}
