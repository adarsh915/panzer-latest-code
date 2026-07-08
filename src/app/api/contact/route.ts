import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    const { 
      name, 
      email, 
      company, 
      city, 
      phone, 
      subject, 
      service, // service dropdown from Home/Resources/Solution pages
      msg, // frontend form uses "msg" for message
      page_source,
      recaptchaToken
    } = data

    if (!name || !email) {
      return NextResponse.json({ message: 'Name and email are required' }, { status: 400 })
    }

    // Verify reCAPTCHA
    // TEMPORARILY DISABLED RECAPTCHA
    // if (process.env.RECAPTCHA_SECRET_KEY && recaptchaToken) {
    //   const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`
    //   const recaptchaRes = await fetch(verifyUrl, { method: 'POST' })
    //   const recaptchaJson = await recaptchaRes.json()
    //   
    //   if (!recaptchaJson.success) {
    //     return NextResponse.json({ message: 'reCAPTCHA verification failed. Please try again.' }, { status: 400 })
    //   }
    // } else if (process.env.RECAPTCHA_SECRET_KEY && !recaptchaToken) {
    //   return NextResponse.json({ message: 'Please complete the reCAPTCHA verification.' }, { status: 400 })
    // }

    const id = crypto.randomUUID()
    
    // Insert into database
    await pool.query(
      `INSERT INTO leads 
       (id, name, email, company, city, phone, subject, message, page_source, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, 
        name, 
        email, 
        company || null, 
        city || null, 
        phone || null, 
        subject || service || null,  // Contact page uses 'subject', others use 'service' dropdown
        msg || null, 
        page_source || null, 
        'New' // Default status
      ]
    )

    return NextResponse.json({ message: 'Contact submitted successfully', success: true })
  } catch (error) {
    console.error('Contact submission error:', error)
    return NextResponse.json({ message: 'Internal server error', success: false }, { status: 500 })
  }
}
