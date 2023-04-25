import type { ClassConstructor } from 'class-transformer'
import type { ValidatorOptions } from 'class-validator'

export type RawConfig = Record<string, any>

export type ConfigLoader = () => RawConfig

export interface TypedConfigOptions<T extends object> {
  /**
   * The root object for application configuration.
   */
  schema: ClassConstructor<T>

  /**
   * Function(s) to load configurations, must be synchronous.
   */
  load: ConfigLoader | ConfigLoader[]

  /**
   * Custom function to validate configurations. It takes an object containing environment
   * variables as input and outputs validated configurations.
   * If exception is thrown in the function it would prevent the application from bootstrapping.
   */
  validate?: (config: Record<string, any>) => Record<string, any>

  /**
   * Custom function to normalize configurations. It takes an object containing environment
   * variables as input and outputs normalized configurations.
   *
   * This function is executed before validation, and can be used to do type casting,
   * variable expanding, etc.
   */
  normalize?: (config: Record<string, any>) => Record<string, any>

  /**
   * Options passed to validator during validation.
   * @see https://github.com/typestack/class-validator
   */
  validationOptions?: ValidatorOptions
}
