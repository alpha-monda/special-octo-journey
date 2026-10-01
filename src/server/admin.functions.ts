import { createServerFn } from '@tanstack/react-start'
import { parseSettings } from '../lib/agent-settings.js'
import { adminLogin, adminLogout, isAdmin, requireAdmin } from './admin-auth.js'
import * as customers from './customers.server.js'
import { listVoices } from './retell-agents.js'

// Admin RPCs. Every function except session/login checks the admin cookie on
// the server; nothing here trusts the browser.

type Json = Record<string, unknown>
const asObject = (data: unknown) => (data && typeof data === 'object' ? (data as Json) : {})
const asId = (data: unknown) => {
  const id = Number(asObject(data).id)
  if (!Number.isInteger(id) || id <= 0) throw new Error('Invalid customer id')
  return id
}
const asAreaCode = (value: unknown) => {
  const code = Number(value)
  return Number.isInteger(code) && code >= 200 && code <= 999 ? code : undefined
}

export const getAdminSession = createServerFn({ method: 'GET' }).handler(async () => ({ signedIn: isAdmin() }))

export const login = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => ({ password: String(asObject(data).password ?? '') }))
  .handler(async ({ data }) => ({ ok: await adminLogin(data.password) }))

export const logout = createServerFn({ method: 'POST' }).handler(async () => {
  adminLogout()
  return { ok: true }
})

export const getVoices = createServerFn({ method: 'GET' }).handler(async () => {
  requireAdmin()
  return listVoices()
})

export const getCustomers = createServerFn({ method: 'GET' }).handler(async () => {
  requireAdmin()
  return customers.listCustomers()
})

export const getCustomerDetail = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => ({ id: asId(data) }))
  .handler(async ({ data }) => {
    requireAdmin()
    return customers.getCustomer(data.id)
  })

export const createCustomer = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => {
    const raw = asObject(data)
    return { customer: customers.parseCustomer(asObject(raw.customer)), settings: parseSettings(raw.settings), areaCode: asAreaCode(raw.areaCode) }
  })
  .handler(async ({ data }) => {
    requireAdmin()
    return customers.createCustomer(data.customer, data.settings, data.areaCode)
  })

export const retryProvision = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => ({ id: asId(data) }))
  .handler(async ({ data }) => {
    requireAdmin()
    return customers.provisionCustomer(data.id)
  })

export const saveSettings = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => {
    const raw = asObject(data)
    return { id: asId(data), settings: parseSettings(raw.settings), note: String(raw.note ?? '').slice(0, 200) || 'Settings updated' }
  })
  .handler(async ({ data }) => {
    requireAdmin()
    return { version: await customers.saveSettings(data.id, data.settings, data.note) }
  })

export const restoreVersion = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => ({ id: asId(data), version: Number(asObject(data).version) }))
  .handler(async ({ data }) => {
    requireAdmin()
    return { version: await customers.restoreVersion(data.id, data.version) }
  })

export const setPaused = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => ({ id: asId(data), paused: Boolean(asObject(data).paused) }))
  .handler(async ({ data }) => {
    requireAdmin()
    await customers.setPaused(data.id, data.paused)
    return { ok: true }
  })

export const updateContact = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => ({ id: asId(data), customer: customers.parseCustomer(asObject(asObject(data).customer)) }))
  .handler(async ({ data }) => {
    requireAdmin()
    await customers.updateContact(data.id, data.customer)
    return { ok: true }
  })
