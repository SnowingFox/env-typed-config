import merge from 'lodash.merge'
import type { ClassConstructor } from 'class-transformer'
import chalk from 'chalk'
import { plainToClass } from 'class-transformer'
import type { ValidationError, ValidatorOptions } from 'class-validator'
import { validateSync } from 'class-validator'
import type { RawConfig, TypedConfigOptions } from './types'
import 'reflect-metadata'

const { blue, red, cyan, yellow } = chalk

export class TypedConfig<T extends object> {
  async init(options: TypedConfigOptions<T>) {
    const rawConfig = await this.getRawConfigAsync(options.load)

    return this.processConfig(options, rawConfig)
  }

  private async processConfig(
    options: TypedConfigOptions<T>,
    rawConfig: RawConfig,
  ) {
    const {
      schema: Config,
      validationOptions,
      normalize = (config: RawConfig) => config,
      validate = this.validateWithClassValidator.bind(this),
    } = options

    if (typeof rawConfig !== 'object') {
      throw new TypeError(
        `Configuration should be an object, received: ${rawConfig}. Please check the return value of \`load()\``,
      )
    }
    const normalized = normalize(rawConfig)
    const config = validate(normalized, Config, validationOptions) as T

    return config
  }

  private async getRawConfigAsync(
    load: TypedConfigOptions<T>['load'],
  ) {
    if (Array.isArray(load)) {
      const config = {}
      for (const fn of load) {
        try {
          const conf = await fn()
          merge(config, conf)
        }
        catch (err: any) {
          // eslint-disable-next-line no-console
          console.log(`Config load failed: ${err.message}`)
        }
      }
      return config
    }
    return load()
  }

  private validateWithClassValidator(
    rawConfig: RawConfig,
    Config: ClassConstructor<T>,
    options?: Partial<ValidatorOptions>,
  ) {
    const config = plainToClass(Config, rawConfig, {
      exposeDefaultValues: true,
    })
    // defaults to strictest validation rules
    const schemaErrors = validateSync(config as object, {
      forbidUnknownValues: true,
      whitelist: true,
      ...options,
    })
    if (schemaErrors.length > 0) {
      const configErrorMessage = this.getConfigErrorMessage(schemaErrors)
      throw new Error(configErrorMessage)
    }
    return config
  }

  private getConfigErrorMessage(errors: ValidationError[]): string {
    const messages = this.formatValidationError(errors)
      .map(({ property, value, constraints }) => {
        const constraintMessage = Object.entries(
          constraints || /* istanbul ignore next */ {},
        )
          .map(
            ([key, val]) =>
              `    - ${key}: ${yellow(val)}, current config is \`${blue(
                JSON.stringify(value),
              )}\``,
          )
          .join('\n')
        const msg = [
          `  - config ${cyan(property)} does not match the following rules:`,
          `${constraintMessage}`,
        ].join('\n')
        return msg
      })
      .filter(Boolean)
      .join('\n')
    const configErrorMessage = red(
      `Configuration is not valid:\n${messages}\n`,
    )
    return configErrorMessage
  }

  private formatValidationError(errors: ValidationError[]) {
    const result: {
      property: string
      constraints: ValidationError['constraints']
      value: ValidationError['value']
    }[] = []
    const helper = (
      { property, constraints, children, value }: ValidationError,
      prefix: string,
    ) => {
      const keyPath = prefix ? `${prefix}.${property}` : property
      if (constraints) {
        result.push({
          property: keyPath,
          constraints,
          value,
        })
      }
      if (children && children.length)
        children.forEach(child => helper(child, keyPath))
    }
    errors.forEach(error => helper(error, ''))
    return result
  }
}

export async function defineConfig<T extends object>(
  options: TypedConfigOptions<T>,
) {
  const typedConfigTarget = new TypedConfig<T>()

  const typedConfig = await typedConfigTarget.init(options)

  return typedConfig
}

export * from './loader/fileLoader'

export * from './loader/dotEnvLoader'
