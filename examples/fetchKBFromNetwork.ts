import { kb } from './context'

export const fetchKBFromNetwork = () => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.responseType = 'blob'
    xhr.open('GET', 'http://localhost:3000/data.kb', true)
    xhr.onload = async ev => {
      await kb.load(xhr.response)
      resolve(xhr.response)
      console.log(kb)
    }
    xhr.onprogress = ev => {
      console.log(ev)
    }
    xhr.onerror = reject
    xhr.send()
  })
}
