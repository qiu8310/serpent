import * as fs from '../fs'
import { logger } from '../logger'

export function createContext() {
  return {
    logger,
    ...fs,
  }
}
