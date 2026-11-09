import { NextRequest, NextResponse } from 'next/server'
import {
  createRecord,
  query,
  type SalesforceContact,
} from '@/lib/salesforce/client'
import { getSalesforceSession } from '@/lib/salesforce/token'

export const dynamic = 'force-dynamic'

/**
 * GET /api/salesforce/contacts
 *
 * Queries the 10 most recent Contacts from Salesforce:
 * `SELECT Id, Name, Email, Phone, Title FROM Contact LIMIT 10`
 */
export async function GET() {
  try {
    const session = await getSalesforceSession()
    if (!session?.salesforceUserId) {
      return NextResponse.json(
        { error: 'Unauthorized — please connect your Salesforce account first.' },
        { status: 401 }
      )
    }

    const result = await query<SalesforceContact>(
      'SELECT Id, Name, Email, Phone, Title FROM Contact LIMIT 10',
      session.salesforceUserId
    )

    return NextResponse.json({
      records: result.records,
      totalSize: result.totalSize,
      instanceUrl: session.instanceUrl,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[API GET /api/salesforce/contacts] Error:', message)
    const status = message.includes('UNAUTHENTICATED') ? 401 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

interface CreateContactRequestBody {
  FirstName?: string
  LastName: string
  Email?: string
  Phone?: string
  Title?: string
}

/**
 * POST /api/salesforce/contacts
 *
 * Creates a new Contact record in Salesforce via REST API v60.0.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSalesforceSession()
    if (!session?.salesforceUserId) {
      return NextResponse.json(
        { error: 'Unauthorized — please connect your Salesforce account first.' },
        { status: 401 }
      )
    }

    const body = (await request.json()) as Partial<CreateContactRequestBody>
    const lastName = body.LastName?.trim()

    if (!lastName) {
      return NextResponse.json(
        { error: 'LastName is required by Salesforce to create a Contact.' },
        { status: 400 }
      )
    }

    const payload: Record<string, string> = {
      LastName: lastName,
    }
    if (body.FirstName?.trim()) payload.FirstName = body.FirstName.trim()
    if (body.Email?.trim()) payload.Email = body.Email.trim()
    if (body.Phone?.trim()) payload.Phone = body.Phone.trim()
    if (body.Title?.trim()) payload.Title = body.Title.trim()

    const created = await createRecord(
      'Contact',
      payload,
      session.salesforceUserId
    )

    const fullName = [payload.FirstName, payload.LastName]
      .filter(Boolean)
      .join(' ')

    const newContact: SalesforceContact = {
      Id: created.id,
      Name: fullName,
      FirstName: payload.FirstName ?? null,
      LastName: payload.LastName,
      Email: payload.Email ?? null,
      Phone: payload.Phone ?? null,
      Title: payload.Title ?? null,
    }

    return NextResponse.json(
      {
        id: created.id,
        success: created.success,
        contact: newContact,
      },
      { status: 201 }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[API POST /api/salesforce/contacts] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
