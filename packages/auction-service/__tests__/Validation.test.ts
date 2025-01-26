import { validateSchema, ValidationError } from '../src/utils/Validator'
import { InventoryInputSchema } from '../src/schemas/Item'

describe('SaleMsgSchema Validation', () => {
  it('should validate a valid sale message with unique items', () => {
    const validMessage = {
      items: [
        { item: 'circle', quantity: 2 },
        { item: 'triangle', quantity: 1 },
        { item: 'square', quantity: 3 },
      ],
    }

    expect(() => validateSchema(InventoryInputSchema, validMessage)).not.toThrow()
  })

  it('should throw a ValidationError for a sale message with duplicate items', () => {
    const invalidMessage = {
      items: [
        { item: 'circle', quantity: 2 },
        { item: 'circle', quantity: 1 },
      ],
    }

    expect(() => validateSchema(InventoryInputSchema, invalidMessage)).toThrow(ValidationError)
  })

  it('should throw a ValidationError for a sale message with more than 3 items', () => {
    const invalidMessage = {
      items: [
        { item: 'circle', quantity: 2 },
        { item: 'triangle', quantity: 1 },
        { item: 'square', quantity: 3 },
        { item: 'hexagon', quantity: 1 },
      ],
    }

    expect(() => validateSchema(InventoryInputSchema, invalidMessage)).toThrow(ValidationError)
  })

  it('should throw a ValidationError for an item with quantity less than 1', () => {
    const invalidMessage = {
      items: [{ item: 'circle', quantity: 0 }],
    }

    expect(() => validateSchema(InventoryInputSchema, invalidMessage)).toThrow(ValidationError)
  })

})
