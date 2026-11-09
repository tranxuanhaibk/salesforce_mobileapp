import {
  getValidAccessToken,
  refreshSalesforceAccessToken,
  SF_API_VERSION,
} from '@/lib/salesforce/token'
import { getServerEnv } from '@/lib/env'
import { createClient } from '@/utils/supabase/server'
import { decrypt, encrypt } from '@/lib/crypto'

export interface SalesforceClient {
  accessToken: string
  instanceUrl: string
  apiVersion: string
}

export interface SalesforceQueryResult<T = Record<string, unknown>> {
  totalSize: number
  done: boolean
  records: T[]
  nextRecordsUrl?: string
}

export interface SalesforceCreateResult {
  id: string
  success: boolean
  errors: unknown[]
}

export interface SalesforceContact {
  Id: string
  Name: string
  FirstName?: string | null
  LastName?: string | null
  Email: string | null
  Phone: string | null
  Title: string | null
  attributes?: {
    type: string
    url: string
  }
}

/**
 * Internal fetch wrapper for Salesforce REST API (v60.0).
 * Automatically handles 401 Unauthorized by refreshing the access token via
 * `refreshSalesforceAccessToken` and retrying the request once.
 */
async function salesforceFetch<T>(
  path: string,
  init: RequestInit = {},
  salesforceUserId?: string
): Promise<T> {
  const tokenInfo = await getValidAccessToken(salesforceUserId)

  const executeRequest = async (accessToken: string, instanceUrl: string) => {
    const url = `${instanceUrl}/services/data/${SF_API_VERSION}${path}`
    const headers = new Headers(init.headers)
    headers.set('Authorization', `Bearer ${accessToken}`)
    if (init.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }

    return fetch(url, {
      ...init,
      headers,
      cache: 'no-store',
    })
  }

  let response = await executeRequest(
    tokenInfo.accessToken,
    tokenInfo.instanceUrl
  )

  if (response.status === 401) {
    const refreshed = await refreshSalesforceAccessToken(
      tokenInfo.salesforceUserId
    )
    response = await executeRequest(
      refreshed.accessToken,
      refreshed.instanceUrl
    )
  }

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(
      `SALESFORCE_REST_ERROR (${response.status}): ${errorBody}`
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

/**
 * Executes a SOQL query against Salesforce REST API v60.0:
 * GET /services/data/v60.0/query/?q=...
 */
export async function query<T = Record<string, unknown>>(
  soql: string,
  salesforceUserId?: string
): Promise<SalesforceQueryResult<T>> {
  const encodedSoql = encodeURIComponent(soql)
  return salesforceFetch<SalesforceQueryResult<T>>(
    `/query/?q=${encodedSoql}`,
    { method: 'GET' },
    salesforceUserId
  )
}

/**
 * Retrieves a single SObject record by ID:
 * GET /services/data/v60.0/sobjects/{sobject}/{id}?fields=...
 */
export async function getRecord<T = Record<string, unknown>>(
  sobject: string,
  id: string,
  fields?: string[],
  salesforceUserId?: string
): Promise<T> {
  const fieldsQuery =
    fields && fields.length > 0
      ? `?fields=${encodeURIComponent(fields.join(','))}`
      : ''
  return salesforceFetch<T>(
    `/sobjects/${encodeURIComponent(sobject)}/${encodeURIComponent(id)}${fieldsQuery}`,
    { method: 'GET' },
    salesforceUserId
  )
}

/**
 * Creates a new SObject record:
 * POST /services/data/v60.0/sobjects/{sobject}/
 */
export async function createRecord(
  sobject: string,
  payload: Record<string, unknown>,
  salesforceUserId?: string
): Promise<SalesforceCreateResult> {
  return salesforceFetch<SalesforceCreateResult>(
    `/sobjects/${encodeURIComponent(sobject)}/`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    salesforceUserId
  )
}

/**
 * Updates an existing SObject record by ID:
 * PATCH /services/data/v60.0/sobjects/{sobject}/{id}
 */
export async function updateRecord(
  sobject: string,
  id: string,
  payload: Record<string, unknown>,
  salesforceUserId?: string
): Promise<{ success: boolean }> {
  await salesforceFetch<void>(
    `/sobjects/${encodeURIComponent(sobject)}/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
    salesforceUserId
  )
  return { success: true }
}

/**
 * Legacy helper for user-id-keyed client (used by /dashboard and /api/salesforce/limits).
 */
export async function getValidSalesforceClient(
  userId: string
): Promise<SalesforceClient> {
  const supabase = await createClient()
  const serverEnv = getServerEnv()
  const encKey = serverEnv.tokenEncryptionKey
  const apiVersion = serverEnv.salesforceApiVersion
  const loginUrl = serverEnv.salesforceLoginUrl

  const { data: creds, error: fetchError } = await supabase
    .from('sf_credentials')
    .select('access_token, refresh_token, instance_url')
    .eq('user_id', userId)
    .single()

  if (fetchError || !creds) {
    throw new Error(
      'SALESFORCE_NOT_CONNECTED: No Salesforce credentials found for this user.'
    )
  }

  const accessToken = decrypt(creds.access_token, encKey)
  const refreshToken = decrypt(creds.refresh_token, encKey)
  const { instance_url: instanceUrl } = creds

  const probeRes = await fetch(
    `${instanceUrl}/services/data/${apiVersion}/limits`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    }
  )

  if (probeRes.ok) {
    return { accessToken, instanceUrl, apiVersion }
  }

  if (probeRes.status !== 401) {
    const body = await probeRes.text()
    throw new Error(
      `SALESFORCE_API_ERROR: Unexpected status ${probeRes.status}: ${body}`
    )
  }

  const refreshParams = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: serverEnv.salesforceClientId,
    client_secret: serverEnv.salesforceClientSecret,
    refresh_token: refreshToken,
  })

  const refreshRes = await fetch(`${loginUrl}/services/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: refreshParams.toString(),
    cache: 'no-store',
  })

  if (!refreshRes.ok) {
    throw new Error(
      'SALESFORCE_REFRESH_FAILED: Refresh token is expired or revoked.'
    )
  }

  const freshData: { access_token: string; instance_url?: string } =
    await refreshRes.json()
  const newAccessToken = freshData.access_token
  const newInstanceUrl = freshData.instance_url ?? instanceUrl

  const encryptedNewAccess = encrypt(newAccessToken, encKey)
  await supabase
    .from('sf_credentials')
    .update({
      access_token: encryptedNewAccess,
      instance_url: newInstanceUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  return {
    accessToken: newAccessToken,
    instanceUrl: newInstanceUrl,
    apiVersion,
  }
}
