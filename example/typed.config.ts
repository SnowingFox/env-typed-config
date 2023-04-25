import { defineConfig, fileLoader } from '../src'
import { AppConfig } from '../test/config'

export const config = await defineConfig({
  schema: AppConfig,
  load: fileLoader({
    searchFrom: 'example',
  }),
})
