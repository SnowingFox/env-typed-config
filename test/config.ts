import { IsNumber, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

class ServerConfig {
  @IsNumber()
  port!: number
}

class JwtConfig {
  @IsString()
  secret!: string

  @IsString()
  expireIn!: string
}

export class AppConfig {
  @Type(() => ServerConfig)
  @ValidateNested()
  server!: ServerConfig

  @Type(() => JwtConfig)
  @ValidateNested()
  jwt!: JwtConfig
}
