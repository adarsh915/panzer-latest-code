'use client'

import React, { useEffect, useState } from 'react'
import PageTitle from '@/components/PageTitle'
import { Card, CardBody, CardHeader, Col, Row, Form, Button, Alert, Spinner } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [message, setMessage] = useState<{ type: 'success' | 'danger', text: string } | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/admin/profile')
        if (res.ok) {
          const data = await res.json()
          setFormData(prev => ({
            ...prev,
            name: data.name || '',
            email: data.email || ''
          }))
        } else {
          setMessage({ type: 'danger', text: 'Failed to load profile data.' })
        }
      } catch (err) {
        setMessage({ type: 'danger', text: 'An error occurred while loading profile.' })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchProfile()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!formData.currentPassword) {
      setMessage({ type: 'danger', text: 'Current password is required to save changes.' })
      return
    }

    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        setMessage({ type: 'danger', text: 'New password must be at least 6 characters.' })
        return
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setMessage({ type: 'danger', text: 'New passwords do not match.' })
        return
      }
    }

    setIsSaving(true)
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully.' })
        // Clear password fields on success
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }))
      } else {
        setMessage({ type: 'danger', text: data.message || 'Failed to update profile.' })
      }
    } catch (err) {
      setMessage({ type: 'danger', text: 'An unexpected error occurred.' })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <>
        <PageTitle title="Admin Profile" />
        <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
          <Spinner animation="border" variant="primary" />
        </div>
      </>
    )
  }

  return (
    <>
      <PageTitle title="Admin Profile" />

      <Row className="justify-content-center">
        <Col xl={8} lg={10}>
          <Card>
            <CardHeader>
              <h4 className="card-title mb-0">Profile Settings</h4>
            </CardHeader>
            <CardBody>
              {message && (
                <Alert variant={message.type} className="d-flex align-items-center">
                  <IconifyIcon 
                    icon={message.type === 'success' ? 'tabler:check' : 'tabler:alert-circle'} 
                    className="me-2 fs-18" 
                  />
                  {message.text}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <h5 className="mb-3 fs-16 border-bottom pb-2">Basic Information</h5>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Enter your name"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email Address</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Enter your email"
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                <div className="mb-4">
                  <h5 className="mb-3 fs-16 border-bottom pb-2">Security</h5>
                  <p className="text-muted fs-13 mb-3">
                    To change your email or password, you must enter your current password.
                  </p>
                  
                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>Current Password <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="password"
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleChange}
                          placeholder="Enter current password to authorize changes"
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>New Password <span className="text-muted fw-normal">(optional)</span></Form.Label>
                        <Form.Control
                          type="password"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleChange}
                          placeholder="Enter new password"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Confirm New Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm new password"
                          disabled={!formData.newPassword}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                <div className="text-end">
                  <Button variant="primary" type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </Form>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  )
}
