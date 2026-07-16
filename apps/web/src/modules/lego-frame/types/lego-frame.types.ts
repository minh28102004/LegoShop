import type {
  Accessory,
  CharacterPart,
  FrameBackground,
  FrameOption,
} from '@lego-shop/shared'

export type CatalogMode = 'finished' | 'character' | 'retail'
export type RetailType = 'frame' | 'background' | 'accessory' | 'character_part'

export type RetailCatalogItem = {
  id: string
  type: RetailType
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  source: FrameOption | FrameBackground | Accessory | CharacterPart
}
