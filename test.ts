import { defineConfig, fileLoader } from 'env-typed-config'
import { AppConfig } from './test/config'

const config = await defineConfig({
  schema: AppConfig,
  load: fileLoader({
    searchFrom: 'test',
  }),
})

console.log(config)
