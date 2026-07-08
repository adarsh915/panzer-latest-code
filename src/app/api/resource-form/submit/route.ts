import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { createSubmission } from '@/app/admin/resources/questionnaires/questionnaireStore'
import { readFooterSettings } from '@/app/admin/settings/footer/footerSettingsStore'
import { sendQuestionnaireEmail } from '@/lib/mailer'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const questionnaireId = formData.get('questionnaireId') as string
    const questionnaireName = formData.get('questionnaireName') as string
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const email = formData.get('email') as string
    const department = formData.get('department') as string
    const notes = formData.get('notes') as string
    const file = formData.get('file') as File | null

    if (!firstName || !lastName || !email || !questionnaireId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let uploadedFileUrl = ''
    let uploadedFilename = ''

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const ext = file.name.split('.').pop() || 'bin'
      const uniqueName = `submission_${Date.now()}.${ext}`
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'submissions')
      
      await mkdir(uploadDir, { recursive: true })
      await writeFile(join(uploadDir, uniqueName), buffer)
      
      uploadedFileUrl = `/uploads/submissions/${uniqueName}`
      uploadedFilename = file.name
    }

    const submission = await createSubmission({
      questionnaireId,
      questionnaireName,
      firstName,
      lastName,
      email,
      department: department || '',
      notes: notes || '',
      uploadedFileUrl,
      uploadedFilename,
    })

    // Fetch the admin email configured in the footer
    const footerSettings = await readFooterSettings()
    const adminEmail = footerSettings.email || 'hello@codespine.in'

    // Send the email with the attachment
    try {
      await sendQuestionnaireEmail({
        adminEmail,
        firstName,
        lastName,
        userEmail: email,
        department: department || '',
        notes: notes || '',
        questionnaireName,
        filePath: uploadedFileUrl ? join(process.cwd(), 'public', uploadedFileUrl) : undefined,
        fileName: uploadedFilename || undefined,
      })
    } catch (mailError) {
      console.error('Failed to send email notification:', mailError)
      // We don't return an error to the user if ONLY the email fails, 
      // since the submission was successfully saved to the database.
    }

    return NextResponse.json({ success: true, id: submission.id })
  } catch (error: any) {
    console.error('Form submission error:', error)
    return NextResponse.json({ error: 'Failed to submit form' }, { status: 500 })
  }
}
