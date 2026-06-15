'use client'

import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import clsx from 'clsx'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { deleteLead, markLeadRead, readLeads, type WebsiteLead } from './leadStore'
import styles from '../solutions/SolutionsPanel.module.scss'

const PAGE_SIZES = [5, 10, 25, 50]

const formatDateTime = (value?: string) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const LeadsPanel = () => {
  const [leads, setLeads] = useState<WebsiteLead[]>([])
  const [selectedLead, setSelectedLead] = useState<WebsiteLead | null>(null)
  const [search, setSearch] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState<keyof WebsiteLead>('submittedAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const loadLeads = async () => {
    setLeads(await readLeads())
  }

  useEffect(() => {
    loadLeads()
  }, [])

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim()

    return leads
      .filter((lead) =>
        !query ||
        lead.name.toLowerCase().includes(query) ||
        lead.email.toLowerCase().includes(query) ||
        lead.serviceLabel.toLowerCase().includes(query) ||
        lead.message.toLowerCase().includes(query) ||
        lead.pageTitle.toLowerCase().includes(query) ||
        lead.pageUrl.toLowerCase().includes(query),
      )
      .sort((a, b) => {
        const first = String(a[sortKey] ?? '')
        const second = String(b[sortKey] ?? '')
        const compare = first.localeCompare(second, undefined, { numeric: true })
        return sortDir === 'asc' ? compare : -compare
      })
  }, [leads, search, sortKey, sortDir])

  const unreadCount = leads.filter((lead) => !lead.read).length
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleSort = (key: keyof WebsiteLead) => {
    if (sortKey === key) setSortDir((direction) => (direction === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const handleMarkRead = async (lead: WebsiteLead) => {
    if (lead.read) return
    await markLeadRead(lead.id)
    await loadLeads()
  }

  const handleDelete = async (lead: WebsiteLead) => {
    if (!window.confirm(`Delete lead from ${lead.name}?`)) return
    await deleteLead(lead.id)
    await loadLeads()
    setSelectedLead(null)
    toast.success('Lead deleted')
  }

  const openLead = async (lead: WebsiteLead) => {
    await handleMarkRead(lead)
    setSelectedLead(lead)
  }

  const SortIcon = ({ col }: { col: keyof WebsiteLead }) => (
    <span className={styles.sortIcon}>
      <IconifyIcon
        icon={sortKey === col
          ? (sortDir === 'asc' ? 'tabler:chevron-up' : 'tabler:chevron-down')
          : 'tabler:selector'}
      />
    </span>
  )

  return (
    <>
      <PageTitle title="Leads" subTitle="Panzer IT" />

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderLeft}>
            <IconifyIcon icon="tabler:mail-opened" />
            <h3>Website Contact Leads</h3>
            <span className={styles.totalBadge}>{leads.length}</span>
            <span className={styles.catChip}>{unreadCount} unread</span>
          </div>
        </div>

        <div className={styles.tableControls}>
          <div className={styles.pageSizeWrap}>
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value))
                setPage(1)
              }}
              aria-label="Entries per page"
            >
              {PAGE_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
            <span>entries per page</span>
          </div>
          <div className={styles.searchWrap}>
            <span>Search:</span>
            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              aria-label="Search website leads"
            />
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.thSort} onClick={() => handleSort('submittedAt')}>Date / Time <SortIcon col="submittedAt" /></th>
                <th className={styles.thSort} onClick={() => handleSort('name')}>Name <SortIcon col="name" /></th>
                <th className={styles.thSort} onClick={() => handleSort('email')}>Email <SortIcon col="email" /></th>
                <th className={styles.thSort} onClick={() => handleSort('serviceLabel')}>Service <SortIcon col="serviceLabel" /></th>
                <th>Message</th>
                <th className={styles.thSort} onClick={() => handleSort('pageTitle')}>Page <SortIcon col="pageTitle" /></th>
                <th className={styles.thSort} onClick={() => handleSort('read')}>Read <SortIcon col="read" /></th>
                <th className={styles.thCenter}>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length > 0 ? (
                paginated.map((lead) => (
                  <tr key={lead.id}>
                    <td>{formatDateTime(lead.submittedAt)}</td>
                    <td>
                      <span className={styles.tdName}>{lead.name}</span>
                    </td>
                    <td>{lead.email}</td>
                    <td><span className={styles.catChip}>{lead.serviceLabel || '-'}</span></td>
                    <td>{lead.message ? `${lead.message.slice(0, 70)}${lead.message.length > 70 ? '...' : ''}` : '-'}</td>
                    <td>
                      <span className={styles.tdName}>{lead.pageTitle}</span>
                      <span className={styles.tdSub}>{lead.pageUrl}</span>
                    </td>
                    <td>
                      <span className={clsx(styles.badge, lead.read ? styles.badgeActive : styles.badgeInactive)}>
                        {lead.read ? 'Read' : 'Unread'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button type="button" className={styles.btnEdit} onClick={() => openLead(lead)} title="View lead">
                          <IconifyIcon icon="tabler:eye" />
                        </button>
                        <button type="button" className={styles.btnDelete} onClick={() => handleDelete(lead)} title="Delete lead">
                          <IconifyIcon icon="tabler:trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className={styles.emptyRow}>
                    <IconifyIcon icon="tabler:mail-off" />
                    <span>No leads found</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.pagination}>
          <span className={styles.pageInfo}>
            {filtered.length === 0
              ? 'No entries'
              : `Showing ${(page - 1) * pageSize + 1} to ${Math.min(page * pageSize, filtered.length)} of ${filtered.length} entries`}
          </span>
          <div className={styles.pageBtns}>
            <button type="button" onClick={() => setPage(1)} disabled={page === 1}>First</button>
            <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1}>Prev</button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                className={clsx(page === pageNumber && styles.pageNumActive)}
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}
            <button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={page === totalPages}>Next</button>
            <button type="button" onClick={() => setPage(totalPages)} disabled={page === totalPages}>Last</button>
          </div>
        </div>
      </div>

      {selectedLead && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Lead details">
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <span className={styles.modalTitleIcon}>
                  <IconifyIcon icon="tabler:mail-opened" />
                </span>
                <h3>Lead Details</h3>
              </div>
              <button type="button" className={styles.closeBtn} onClick={() => setSelectedLead(null)} aria-label="Close">
                <IconifyIcon icon="tabler:x" />
              </button>
            </div>
            <div className={styles.deleteBody}>
              <p><strong>Name:</strong> {selectedLead.name}</p>
              <p><strong>Email:</strong> {selectedLead.email}</p>
              <p><strong>Service:</strong> {selectedLead.serviceLabel} ({selectedLead.service || '-'})</p>
              <p><strong>Message:</strong><br />{selectedLead.message || '-'}</p>
              <p><strong>Submitted:</strong> {formatDateTime(selectedLead.submittedAt)}</p>
              <p><strong>Page:</strong> {selectedLead.pageTitle} - {selectedLead.pageUrl}</p>
              <p><strong>Referrer:</strong> {selectedLead.referrer || '-'}</p>
              <p><strong>Read:</strong> {selectedLead.read ? `Yes${selectedLead.readAt ? `, ${formatDateTime(selectedLead.readAt)}` : ''}` : 'No'}</p>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setSelectedLead(null)}>Close</button>
                <button type="button" className={styles.deleteBtn} onClick={() => handleDelete(selectedLead)}>
                  <IconifyIcon icon="tabler:trash" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default LeadsPanel
