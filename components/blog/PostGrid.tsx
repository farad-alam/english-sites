import PostCard from './PostCard'
import type { CountryConfig } from '@/lib/country'
import type { PostCardData } from '@/sanity/types'

export default function PostGrid({ posts, country, emptyText = 'No articles yet — check back soon.', priorityFirst }: { posts: PostCardData[]; country: CountryConfig; emptyText?: string; priorityFirst?: boolean }) {
  if (!posts.length) {
    return (
      <div className="text-center py-16 bg-surface-card rounded-2xl border border-surface-border">
        <p className="text-text-muted">{emptyText}</p>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {posts.map((post, i) => (
        <PostCard key={post._id} post={post} country={country} priority={priorityFirst && i < 3} />
      ))}
    </div>
  )
}
