import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { CreateCategoryData, Category, CategoryColor } from '../../../types'
import Input from '../../common/Input'
import Button from '../../common/Button'
import { getCategoryColorStyles } from '../../../utils/categoryUtils'

interface CategoryFormProps {
  initialData?: Category
  onSubmit: (data: CreateCategoryData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<CreateCategoryData>({
    defaultValues: {
      name: initialData?.name || '',
      color: initialData?.color || CategoryColor.BLUE
    }
  })

  const selectedColor = watch('color')

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        color: initialData.color
      })
    }
  }, [initialData, reset])

  const colors = Object.values(CategoryColor)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        label="Category Name"
        {...register('name', { required: 'Category name is required' })}
        error={errors.name?.message}
        placeholder="e.g. Groceries, Rent, Salary"
        autoFocus
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Color Code</label>
        <div className="grid grid-cols-6 gap-3">
          {colors.map((color) => {
            const styles = getCategoryColorStyles(color)
            return (
              <button
                key={color}
                type="button"
                onClick={() => setValue('color', color)}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200
                  ${styles.bg} ${styles.text} border ${styles.border}
                  hover:scale-110 focus:outline-none
                  ${selectedColor === color ? `ring-2 ring-offset-2 ${styles.ring} scale-110 ring-opacity-60` : 'hover:opacity-90'}
                `}
                title={color}
              >
                {selectedColor === color && (
                  <div className={`w-3 h-3 rounded-full bg-current`} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Update Category' : 'Create Category'}
        </Button>
      </div>
    </form>
  )
}

export default CategoryForm
