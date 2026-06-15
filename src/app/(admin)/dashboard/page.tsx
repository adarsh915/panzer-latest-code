import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { MOCK_BRANDS, MOCK_DOWNLOADS, MOCK_LEADS, MOCK_MEDIA, MOCK_POSTS, MOCK_SOLUTIONS } from '@/data/panzer/mock'
import Link from 'next/link'
import { Badge, Card, CardBody, CardHeader, Col, ProgressBar, Row, Table } from 'react-bootstrap'

const modules = [
  {
    title: 'Blog Posts',
    href: '/posts',
    icon: 'tabler:article',
    total: MOCK_POSTS.length,
    detail: `${MOCK_POSTS.filter((post) => post.status === 'published').length} published`,
    color: 'primary',
  },
  {
    title: 'Solutions & Services',
    href: '/solutions',
    icon: 'tabler:shield-check',
    total: MOCK_SOLUTIONS.length,
    detail: `${MOCK_SOLUTIONS.filter((solution) => solution.status === 'active').length} active`,
    color: 'success',
  },
  {
    title: 'Brands & Partners',
    href: '/brands',
    icon: 'tabler:building-store',
    total: MOCK_BRANDS.length,
    detail: `${MOCK_BRANDS.filter((brand) => brand.featured).length} featured`,
    color: 'info',
  },
  {
    title: 'Leads',
    href: '/leads',
    icon: 'tabler:mail-opened',
    total: MOCK_LEADS.length,
    detail: `${MOCK_LEADS.filter((lead) => lead.status === 'new').length} new`,
    color: 'warning',
  },
  {
    title: 'Downloads',
    href: '/downloads',
    icon: 'tabler:download',
    total: MOCK_DOWNLOADS.length,
    detail: `${MOCK_DOWNLOADS.reduce((sum, item) => sum + item.downloadCount, 0)} total downloads`,
    color: 'danger',
  },
  {
    title: 'Media Library',
    href: '/media',
    icon: 'tabler:photo',
    total: MOCK_MEDIA.length,
    detail: `${MOCK_MEDIA.reduce((sum, item) => sum + item.sizeKb, 0)} KB stored`,
    color: 'secondary',
  },
]

const leadStatusVariant: Record<string, string> = {
  new: 'primary',
  contacted: 'info',
  qualified: 'success',
  closed: 'secondary',
  spam: 'danger',
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(value))

const DashboardPage = () => {
  const activeSolutions = MOCK_SOLUTIONS.filter((solution) => solution.status === 'active').length
  const publishedPosts = MOCK_POSTS.filter((post) => post.status === 'published').length
  const newLeads = MOCK_LEADS.filter((lead) => lead.status === 'new').length
  const totalDownloads = MOCK_DOWNLOADS.reduce((sum, item) => sum + item.downloadCount, 0)

  return (
    <>
      <PageTitle title="Dashboard" />

      <Row>
        <Col xl={3} md={6}>
          <Card>
            <CardBody>
              <div className="d-flex align-items-center gap-3">
                <div className="avatar-md rounded bg-primary-subtle text-primary d-flex align-items-center justify-content-center">
                  <IconifyIcon icon="tabler:shield-check" className="fs-24" />
                </div>
                <div>
                  <p className="text-muted mb-1">Active Services</p>
                  <h3 className="mb-0">{activeSolutions}</h3>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col xl={3} md={6}>
          <Card>
            <CardBody>
              <div className="d-flex align-items-center gap-3">
                <div className="avatar-md rounded bg-success-subtle text-success d-flex align-items-center justify-content-center">
                  <IconifyIcon icon="tabler:article" className="fs-24" />
                </div>
                <div>
                  <p className="text-muted mb-1">Published Posts</p>
                  <h3 className="mb-0">{publishedPosts}</h3>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col xl={3} md={6}>
          <Card>
            <CardBody>
              <div className="d-flex align-items-center gap-3">
                <div className="avatar-md rounded bg-warning-subtle text-warning d-flex align-items-center justify-content-center">
                  <IconifyIcon icon="tabler:mail-opened" className="fs-24" />
                </div>
                <div>
                  <p className="text-muted mb-1">New Leads</p>
                  <h3 className="mb-0">{newLeads}</h3>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col xl={3} md={6}>
          <Card>
            <CardBody>
              <div className="d-flex align-items-center gap-3">
                <div className="avatar-md rounded bg-danger-subtle text-danger d-flex align-items-center justify-content-center">
                  <IconifyIcon icon="tabler:download" className="fs-24" />
                </div>
                <div>
                  <p className="text-muted mb-1">Downloads</p>
                  <h3 className="mb-0">{totalDownloads}</h3>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row>
        {modules.map((item) => (
          <Col xxl={3} xl={4} md={6} key={item.href}>
            <Card>
              <CardBody>
                <div className="d-flex align-items-start justify-content-between gap-3">
                  <div>
                    <p className="text-muted mb-1">{item.title}</p>
                    <h4 className="mb-1">{item.total}</h4>
                    <span className="text-muted fs-13">{item.detail}</span>
                  </div>
                  <div className={`avatar-md rounded bg-${item.color}-subtle text-${item.color} d-flex align-items-center justify-content-center`}>
                    <IconifyIcon icon={item.icon} className="fs-24" />
                  </div>
                </div>
                <Link href={item.href} className="btn btn-sm btn-light w-100 mt-3">
                  Manage
                </Link>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>

      <Row>
        <Col xl={7}>
          <Card>
            <CardHeader className="d-flex align-items-center justify-content-between">
              <h5 className="card-title mb-0">Recent Leads</h5>
              <Link href="/leads" className="btn btn-sm btn-soft-primary">
                View All
              </Link>
            </CardHeader>
            <CardBody className="p-0">
              <Table responsive hover className="mb-0">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_LEADS.map((lead) => (
                    <tr key={lead.id}>
                      <td className="fw-medium">{lead.name}</td>
                      <td>{lead.email}</td>
                      <td>
                        <Badge bg={leadStatusVariant[lead.status]}>{lead.status}</Badge>
                      </td>
                      <td>{formatDate(lead.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        </Col>
        <Col xl={5}>
          <Card>
            <CardHeader>
              <h5 className="card-title mb-0">Content Health</h5>
            </CardHeader>
            <CardBody>
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="fw-medium">Published blog posts</span>
                  <span>{publishedPosts}/{MOCK_POSTS.length}</span>
                </div>
                <ProgressBar now={(publishedPosts / MOCK_POSTS.length) * 100} variant="success" />
              </div>
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="fw-medium">Active services</span>
                  <span>{activeSolutions}/{MOCK_SOLUTIONS.length}</span>
                </div>
                <ProgressBar now={(activeSolutions / MOCK_SOLUTIONS.length) * 100} variant="primary" />
              </div>
              <div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="fw-medium">Featured brands</span>
                  <span>{MOCK_BRANDS.filter((brand) => brand.featured).length}/{MOCK_BRANDS.length}</span>
                </div>
                <ProgressBar now={(MOCK_BRANDS.filter((brand) => brand.featured).length / MOCK_BRANDS.length) * 100} variant="info" />
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col xl={6}>
          <Card>
            <CardHeader>
              <h5 className="card-title mb-0">Top Downloads</h5>
            </CardHeader>
            <CardBody>
              {MOCK_DOWNLOADS.map((download) => (
                <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3" key={download.id}>
                  <div>
                    <h6 className="mb-1">{download.title}</h6>
                    <span className="text-muted fs-13">/{download.slug}</span>
                  </div>
                  <Badge bg="danger">{download.downloadCount}</Badge>
                </div>
              ))}
              <Link href="/downloads" className="btn btn-sm btn-light w-100">
                Manage Downloads
              </Link>
            </CardBody>
          </Card>
        </Col>
        <Col xl={6}>
          <Card>
            <CardHeader>
              <h5 className="card-title mb-0">Quick Actions</h5>
            </CardHeader>
            <CardBody>
              <Row className="g-2">
                {modules.slice(0, 6).map((item) => (
                  <Col sm={6} key={`quick-${item.href}`}>
                    <Link href={item.href} className="btn btn-light w-100 text-start">
                      <IconifyIcon icon={item.icon} className="me-2 fs-18" />
                      {item.title}
                    </Link>
                  </Col>
                ))}
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default DashboardPage
