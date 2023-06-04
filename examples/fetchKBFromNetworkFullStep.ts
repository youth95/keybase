import { fetchKBFromNetwork } from './fetchKBFromNetwork'
import { saveToLocal } from './saveToLocal'
import { showElementFromKeybaseInstance } from './showElementFromKeybaseInstance'

export const fetchKBFromNetworkFullStep = async () => {
  await fetchKBFromNetwork()
  saveToLocal()
  await showElementFromKeybaseInstance()
}
