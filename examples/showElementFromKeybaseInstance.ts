import { appendElement } from './appendElementWhenDrop'
import { kb, mainId, runtime } from './context'

export const showElementFromKeybaseInstance = async () => {
  runtime.schema = JSON.parse(
    new TextDecoder().decode(await kb.assets[mainId].data.arrayBuffer())
  )
  console.log(runtime)
  Object.keys(runtime.schema.positions).forEach(id => {
    const [x, y] = runtime.schema.positions[id]
    appendElement(kb.assets[id].data, x, y)
  })
}
