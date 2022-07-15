import type { LinkTabProps } from './LinkTab'

export const sg721LinkTabs: LinkTabProps[] = [
  {
    title: 'Instantiate',
    description: `Create a new SG721 contract`,
    href: '/contracts/sg721/instantiate',
  },
  {
    title: 'Query',
    description: `Dispatch queries with your SG721 contract`,
    href: '/contracts/sg721/query',
  },
  {
    title: 'Execute',
    description: `Execute SG721 contract actions`,
    href: '/contracts/sg721/execute',
  },
]

export const minterLinkTabs: LinkTabProps[] = [
  {
    title: 'Instantiate',
    description: `Initialize a new Minter contract`,
    href: '/contracts/minter/instantiate',
  },
  {
    title: 'Query',
    description: `Dispatch queries with your Minter contract`,
    href: '/contracts/minter/query',
  },
  {
    title: 'Execute',
    description: `Execute Minter contract actions`,
    href: '/contracts/minter/execute',
  },
]
