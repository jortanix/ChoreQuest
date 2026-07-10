import { describe, it, expect, beforeEach } from 'vitest'
import { setAccessToken, clearAccessToken, getAccessToken } from '../lib/api'
import { isAuthenticated } from '../lib/auth'

describe('auth', () => {
  beforeEach(() => clearAccessToken())

  it('démarre sans token', () => {
    expect(isAuthenticated()).toBe(false)
  })

  it('stocke un token', () => {
    setAccessToken('abc123')
    expect(getAccessToken()).toBe('abc123')
    expect(isAuthenticated()).toBe(true)
  })

  it('efface le token', () => {
    setAccessToken('abc123')
    clearAccessToken()
    expect(isAuthenticated()).toBe(false)
  })
})