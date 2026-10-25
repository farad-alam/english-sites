/** Shown only until a Sanity project is connected (NEXT_PUBLIC_SANITY_PROJECT_ID is empty). */
export default function SetupNotice() {
  return (
    <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <div className="rounded-xl border border-amber-300 bg-amber-50 text-amber-900 px-5 py-4 text-sm leading-relaxed">
        <strong>Almost there.</strong> This site is running without a Sanity project. Set <code className="font-mono">NEXT_PUBLIC_SANITY_PROJECT_ID</code> and
        redeploy, then open <code className="font-mono">/studio</code> and fill in <em>Site Settings</em>. See README → “Launch a new site”.
      </div>
    </div>
  )
}
