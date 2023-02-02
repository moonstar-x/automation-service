export interface RepoData {
  user: string
  name: string
  namespace: string
  repository_type: 'image' | string
  status: number
  status_description: string
  description: string | null
  is_private: boolean
  is_automated: boolean
  can_edit: boolean
  star_count: number
  pull_count: number
  last_updated: string
  date_registered: string
  collaborator_count: number
  affiliation: string | null
  hub_user: string
  has_starred: boolean
  full_description: string | null
  permissions: {
    read: boolean
    write: boolean
    admin: boolean
  }
  media_types: string[]
  content_types: string[]
}
