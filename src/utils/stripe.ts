import axios from "axios"

const axiosNotion = axios.create({
  baseURL: `${process.env.PLASMO_PUBLIC_STRIPE_HOST}/api/stripe`,
  headers: {
    "Content-Type": "application/json"
  }
})

export const createCustomer = (data: any) =>
  axiosNotion.post(`/customer`, data).then((r) => r.data)

export const getPayment = (userId: string) =>
  axiosNotion.post(`/payment/${userId}`).then((r) => r.data)

export const prices = () => axiosNotion.post(`/prices`).then((r) => r.data)


export const getHtml = (data: any) =>
  axiosNotion.post(`/html`, data).then((r) => r.data)
