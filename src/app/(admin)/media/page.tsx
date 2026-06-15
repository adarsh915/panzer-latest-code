'use client'

import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { MediaItem } from '@/data/panzer/mock'
import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { Row, Col, Card, Button, Form, Modal } from 'react-bootstrap'
import { createMedia, deleteMedia, readMedia, updateMedia } from './mediaStore'

const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

const MediaPage = () => {
  const [items, setItems] = useState<MediaItem[]>([])
  const [activeItem, setActiveItem] = useState<MediaItem | null>(null)
  const [editFilename, setEditFilename] = useState('')
  const [editAltText, setEditAltText] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [showModal, setShowModal] = useState(false)

  const loadMedia = async () => {
    setItems(await readMedia())
  }

  useEffect(() => {
    loadMedia()
  }, [])

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file.')
      event.target.value = ''
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.warn('Large file uploaded. Local storage might hit its quota.')
    }

    const reader = new FileReader()
    reader.onload = async () => {
      const url = typeof reader.result === 'string' ? reader.result : ''
      await createMedia({
        filename: file.name,
        type: file.type,
        sizeKb: Math.round(file.size / 1024),
        url,
        altText: '',
      })
      toast.success('Media uploaded successfully.')
      await loadMedia()
      event.target.value = ''
    }
    reader.onerror = () => toast.error('Failed to read file.')
    reader.readAsDataURL(file)
  }

  const selectItem = (item: MediaItem) => {
    setActiveItem(item)
    setEditFilename(item.filename)
    setEditAltText(item.altText || '')
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setActiveItem(null)
  }

  const handleSave = async () => {
    if (!activeItem) return
    await updateMedia(activeItem.id, {
      filename: editFilename.trim() || activeItem.filename,
      altText: editAltText.trim(),
    })
    toast.success('Media details updated.')
    await loadMedia()
    handleCloseModal()
  }

  const handleDelete = async () => {
    if (!activeItem) return
    if (window.confirm('Are you sure you want to delete this media item?')) {
      await deleteMedia(activeItem.id)
      toast.success('Media deleted successfully.')
      await loadMedia()
      handleCloseModal()
    }
  }

  return (
    <>
      <PageTitle title="Media Library" subTitle="Panzer IT" />

      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h4 className="header-title mb-0">Files</h4>
          <div>
            <Button variant="primary" onClick={() => fileInputRef.current?.click()}>
              <IconifyIcon icon="tabler:upload" className="me-1" />
              Upload New Media
            </Button>
            <input 
              type="file" 
              accept="image/*" 
              className="d-none" 
              ref={fileInputRef} 
              onChange={handleUpload} 
            />
          </div>
        </Card.Header>
        <Card.Body>
          {items.length === 0 ? (
            <div className="text-center p-5 text-muted">
              <IconifyIcon icon="tabler:photo-off" style={{ fontSize: '48px', opacity: 0.5 }} className="mb-3" />
              <h5>No media files found</h5>
              <p>Upload some images to get started.</p>
              <Button variant="outline-primary" onClick={() => fileInputRef.current?.click()}>
                <IconifyIcon icon="tabler:upload" className="me-1" />
                Upload Image
              </Button>
            </div>
          ) : (
            <Row className="g-3">
              {items.map((item) => (
                <Col md={4} lg={3} xl={2} key={item.id}>
                  <Card 
                    className="h-100 shadow-sm border" 
                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    onClick={() => selectItem(item)}
                    onMouseEnter={(e) => e.currentTarget.classList.add('border-primary')}
                    onMouseLeave={(e) => e.currentTarget.classList.remove('border-primary')}
                  >
                    <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: '140px', overflow: 'hidden' }}>
                      {item.url ? (
                        <img 
                          src={item.url} 
                          alt={item.altText || item.filename} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      ) : (
                        <IconifyIcon icon="tabler:file-unknown" className="text-muted" style={{ fontSize: '32px' }} />
                      )}
                    </div>
                    <Card.Body className="p-2">
                      <h6 className="text-truncate mb-1" title={item.filename}>{item.filename}</h6>
                      <small className="text-muted">{formatBytes(item.sizeKb * 1024)}</small>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Media Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {activeItem && (
            <>
              <div className="bg-light text-center rounded mb-3" style={{ height: '200px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {activeItem.url ? (
                  <img src={activeItem.url} alt={activeItem.altText || activeItem.filename} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : (
                  <IconifyIcon icon="tabler:file-unknown" className="text-muted" style={{ fontSize: '48px' }} />
                )}
              </div>
              
              <ul className="list-unstyled mb-3 text-muted small">
                <li><strong>Uploaded:</strong> {new Date(activeItem.createdAt).toLocaleDateString()}</li>
                <li><strong>Type:</strong> {activeItem.type}</li>
                <li><strong>Size:</strong> {formatBytes(activeItem.sizeKb * 1024)}</li>
              </ul>

              <Form.Group className="mb-3">
                <Form.Label>File Name</Form.Label>
                <Form.Control 
                  type="text" 
                  value={editFilename} 
                  onChange={(e) => setEditFilename(e.target.value)} 
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Alternative Text (alt)</Form.Label>
                <Form.Control 
                  type="text" 
                  value={editAltText} 
                  onChange={(e) => setEditAltText(e.target.value)} 
                  placeholder="Describe the image for SEO"
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="justify-content-between">
          <Button variant="outline-danger" onClick={handleDelete}>
            <IconifyIcon icon="tabler:trash" className="me-1" />
            Delete
          </Button>
          <div>
            <Button variant="light" onClick={handleCloseModal} className="me-2">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default MediaPage
