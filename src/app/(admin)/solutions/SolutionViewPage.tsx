'use client'

import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import clsx from 'clsx'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { findSolution, type SolutionService } from './solutionStore'
import styles from '../posts/PostViewPage.module.scss'

type Props = {
  solutionId: string
}

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

const SolutionViewPage = ({ solutionId }: Props) => {
  const [solution, setSolution] = useState<SolutionService | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    findSolution(solutionId).then((sol) => {
      setSolution(sol ?? null)
      setLoaded(true)
    })
  }, [solutionId])

  return (
    <div className={styles.shell}>
      <PageTitle title="View Solution & Service" subTitle="Solutions & Services" />

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <IconifyIcon icon="tabler:eye" />
            <h3>Solution Details</h3>
          </div>
          <div className={styles.headerActions}>
            <Link href="/solutions" className={styles.backBtn}>
              <IconifyIcon icon="tabler:arrow-left" />
              Back to Solutions
            </Link>
            {solution && (
              <Link href={`/solutions/${solution.id}/edit`} className={styles.editBtn}>
                <IconifyIcon icon="tabler:pencil" />
                Edit Solution
              </Link>
            )}
          </div>
        </div>

        {!loaded ? (
          <div className={styles.notFound}>Loading solution...</div>
        ) : !solution ? (
          <div className={styles.notFound}>Solution not found.</div>
        ) : (
          <div className={styles.body}>
            <div className={styles.hero}>
              <div className={styles.titleRow}>
                <div>
                  <h1 className={styles.title}>{solution.title}</h1>
                  {solution.subtitle && <p className={styles.metaValue}>{solution.subtitle}</p>}
                </div>
                <span className={clsx(styles.badge, solution.status === 'active' ? styles.badgePublished : styles.badgeDraft)}>
                  {solution.status}
                </span>
              </div>
            </div>

            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Slug</span>
                <code className={styles.slugCode}>{solution.slug}</code>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Category</span>
                <span className={styles.metaValue}>{solution.category}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Order</span>
                <span className={styles.metaValue}>{solution.order}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Created</span>
                <span className={styles.metaValue}>{formatDateTime(solution.createdAt)}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Status</span>
                <span className={styles.metaValue}>{solution.status}</span>
              </div>
            </div>

            {solution.image && (
              <div className={styles.featuredImage}>
                <img src={solution.image} alt={solution.imageAlt || solution.title} />
              </div>
            )}

            {solution.logo && (
              <div className={styles.featuredImage}>
                <img src={solution.logo} alt={solution.logoAlt || solution.title} />
              </div>
            )}

            <div className={styles.seoBox}>
              <div className={styles.seoHeader}>
                <IconifyIcon icon="tabler:seo" />
                <h4>SEO</h4>
              </div>
              <div className={styles.seoGrid}>
                <div>
                  <span>Meta Title</span>
                  <p>{solution.metaTitle || '-'}</p>
                </div>
                <div>
                  <span>Meta Description</span>
                  <p>{solution.metaDescription || '-'}</p>
                </div>
                <div>
                  <span>Meta Keywords</span>
                  <p>{solution.metaKeywords || '-'}</p>
                </div>
                <div>
                  <span>Image Alt Text</span>
                  <p>{solution.imageAlt || '-'}</p>
                </div>
                <div>
                  <span>Logo Alt Text</span>
                  <p>{solution.logoAlt || '-'}</p>
                </div>
              </div>
            </div>

            <div className={styles.seoBox}>
              <div className={styles.seoHeader}>
                <IconifyIcon icon="tabler:layout-grid-add" />
                <h4>Feature Cards</h4>
              </div>
              <div className={styles.seoGrid}>
                {solution.featureCards.length > 0 ? solution.featureCards.map((card) => (
                  <div key={card.id}>
                    <span>{card.icon}</span>
                    {card.image && (
                      <p>
                        <img
                          src={card.image}
                          alt={card.imageAlt || card.title}
                          style={{ width: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }}
                        />
                      </p>
                    )}
                    <p><strong>{card.title}</strong><br />{card.description}</p>
                  </div>
                )) : <p>No feature cards added.</p>}
              </div>
            </div>

            <div className={styles.seoBox}>
              <div className={styles.seoHeader}>
                <IconifyIcon icon="tabler:git-branch" />
                <h4>Implementation Flow</h4>
              </div>
              <div className={styles.seoGrid}>
                {solution.implementationSteps.length > 0 ? solution.implementationSteps.map((step) => (
                  <div key={step.id}>
                    <span>{step.step}</span>
                    <p><strong>{step.title}</strong><br />{step.description}</p>
                  </div>
                )) : <p>No implementation steps added.</p>}
              </div>
            </div>

            {solution.extraCards && solution.extraCards.length > 0 && (
              <div className={styles.seoBox}>
                <div className={styles.seoHeader}>
                  <IconifyIcon icon="tabler:cards" />
                  <h4>Cards</h4>
                </div>
                <div className={styles.seoGrid}>
                  {solution.extraCards.map((card) => (
                    <div key={card.id}>
                      {card.image && (
                        <p>
                          <img
                            src={card.image}
                            alt={card.imageAlt || card.heading}
                            style={{ width: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }}
                          />
                        </p>
                      )}
                      <div>
                        <strong>{card.heading}</strong>
                        <div dangerouslySetInnerHTML={{ __html: card.description }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <article
              className={styles.content}
              dangerouslySetInnerHTML={{ __html: solution.description || '<p>No description added.</p>' }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default SolutionViewPage
