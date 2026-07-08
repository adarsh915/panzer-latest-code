'use client'

import Image from 'next/image'
import React from 'react'
import avatar1 from '@/assets/images/users/avatar-1.jpg'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap'
import { useAuthContext } from '@/context/useAuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const ProfileDropdown = () => {
  const { logout } = useAuthContext()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  return (
    <div className="topbar-item nav-user">
      <Dropdown>
        <DropdownToggle as={'a'} className="topbar-link drop-arrow-none px-2" data-bs-toggle="dropdown" data-bs-offset="0,19" type="button" aria-haspopup="false" aria-expanded="false">
          <Image src={avatar1} width={32} className="rounded-circle me-lg-2 d-flex" alt="user-image" />
          <IconifyIcon icon='tabler:chevron-down' className="d-none d-lg-block align-middle ms-2" />
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-end">
          <DropdownItem as={Link} href="/admin/profile">
            <IconifyIcon icon='tabler:user-hexagon' className=" me-1 fs-17 align-middle" />
            <span className="align-middle">My Account</span>
          </DropdownItem>
          <DropdownItem onClick={handleLogout}>
            <IconifyIcon icon='tabler:logout' className=" me-1 fs-17 align-middle text-danger" />
            <span className="align-middle text-danger">Logout</span>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  )
}

export default ProfileDropdown
