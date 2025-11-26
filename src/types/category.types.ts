export enum CategoryColor {
  BLUE = 'blue',
  GREEN = 'green',
  AMBER = 'amber',
  PURPLE = 'purple',
  RED = 'red',
  PINK = 'pink'
}

export interface Category {
  id: string
  name: string
  color: CategoryColor
  usageCount: number
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryData {
  name: string
  color: CategoryColor
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {}
