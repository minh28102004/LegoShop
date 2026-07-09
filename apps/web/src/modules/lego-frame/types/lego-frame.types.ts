import type {
  Accessory,
  FrameBackground,
  FrameOption,
} from '@lego-shop/shared'

export type CatalogMode = 'finished' | 'retail'
export type RetailType = 'frame' | 'background' | 'accessory'

export type RetailCatalogItem = {
  id: string
  type: RetailType
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  source: FrameOption | FrameBackground | Accessory
}
