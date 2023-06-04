import {
  addEventListenerWithPreventDefault,
  defineInWindow,
  showBlob
} from './utils'
import { hidePlacehodler, showPlaceholder } from './placeholder'
import { saveToKeybase } from './saveToKeybase'
import { dropzoneDOM, kb } from './context'
import { appendElementWhenDrop } from './appendElementWhenDrop'
import { showElementFromKeybaseInstance } from './showElementFromKeybaseInstance'
import { saveToLocal } from './saveToLocal'
import { fetchKBFromNetwork } from './fetchKBFromNetwork'
import { loadFromLocal } from './loadFromLocal'
import { fetchKBFromNetworkFullStep } from './fetchKBFromNetworkFullStep'
import { download } from './download'

const listenDrop = addEventListenerWithPreventDefault(dropzoneDOM, 'drop')
const listenDragover = addEventListenerWithPreventDefault(
  dropzoneDOM,
  'dragover'
)

listenDrop(saveToKeybase) // 拖拽文件完成时 将其blob引用加入 keybase

listenDrop(appendElementWhenDrop) // 文件拖拽完成时 生成对应的预览元素 并且记录位置信息

listenDrop(hidePlacehodler) // 文件拖拽完成时 隐藏 placehodler

listenDragover(showPlaceholder) // 拖动过程中 显示 placeholder

defineInWindow({
  kb, // keyBase 实例
  showElementFromKeybaseInstance, // 从 keybase 实例中加载所有可见元素
  saveToLocal, // 将 keybase 实例 加载到 indexdb
  loadFromLocal, // 从 indexdb 加载 keybase
  fetchKBFromNetwork, // 从网络加载 keybase
  fetchKBFromNetworkFullStep, // 从网络加载 keybase 并显示可见元素
  showBlob, // 显示 blob
  download // 下载当前 keybase
})
