import { describe, expect, test } from 'vitest'
import { defineConfig, fileLoader } from '../src'
import { AppConfig } from './config'

describe('config', () => {
  test('should load config from .env.toml file', async () => {
    const config = await defineConfig({
      schema: AppConfig,
      load: fileLoader({
        searchFrom: 'test',
      }),
    })

    expect(config).toMatchInlineSnapshot(`
      AppConfig {
        "jwt": JwtConfig {
          "expireIn": "30d",
          "secret": "secret",
        },
        "server": ServerConfig {
          "port": 3000,
        },
      }
    `)
  })
})
