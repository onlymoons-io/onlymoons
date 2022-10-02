import React, { AnchorHTMLAttributes, ReactNode } from 'react'
import { Link, LinkProps } from 'react-router-dom'

export interface LinkOrAnchorProps {
  children?: ReactNode
}

const LinkOrAnchor: React.FC<
  Partial<AnchorHTMLAttributes<HTMLAnchorElement>> & Partial<LinkProps> & LinkOrAnchorProps
> = ({ children, to, href, target = '_blank', rel = 'noreferrer noopener', ...rest }) => {
  return to ? (
    <Link to={to} {...rest}>
      {children}
    </Link>
  ) : (
    <a href={href} target={target} rel={rel} {...rest}>
      {children}
    </a>
  )
}

export default LinkOrAnchor
