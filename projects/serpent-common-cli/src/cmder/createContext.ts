import * as fs from '../fs'
import { getBoolEnv, loadScript } from '../helper'
import { logger } from '../logger'

export function createContext() {
  return {
    logger,
    getBoolEnv,
    loadScript,
    ...fs,
  }
}
