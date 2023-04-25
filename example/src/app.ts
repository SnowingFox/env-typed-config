import express from 'express'
import { config } from '../typed.config'

const app = express()

const {
  server: { port },
  jwt: {
    expireIn,
    secret,
  },
} = config

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on port ${port}`)
  // eslint-disable-next-line no-console
  console.log('expireIn', expireIn)
  // eslint-disable-next-line no-console
  console.log('secret', secret)
})
