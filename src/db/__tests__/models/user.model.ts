import { AutoIncrement, Field, Model } from '../../decorators'

@Model()
export class User {
  @AutoIncrement()
  @Field({ type: 'number' })
  id!: number

  @Field({ type: 'string', required: true, min: 2, max: 50 })
  name!: string

  @Field({ type: 'number', min: 0, max: 150 })
  age?: number
}
