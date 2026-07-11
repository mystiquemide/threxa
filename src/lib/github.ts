import { createHmac, timingSafeEqual } from "node:crypto"

const API = "https://api.github.com"
const MARKER = "<!-- threxa -->"

function ghHeaders() {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "threxa",
  }
}

export function verifySignature(payload: string, signature: string | null): boolean {
  const secret = process.env.GITHUB_WEBHOOK_SECRET
  if (!secret || !signature) return false
  const expected =
    "sha256=" + createHmac("sha256", secret).update(payload).digest("hex")
  const a = Buffer.from(expected)
  const b = Buffer.from(signature)
  return a.length === b.length && timingSafeEqual(a, b)
}

export interface PrFile {
  filename: string
  status: string
  patch?: string
}

export async function fetchPrFiles(
  owner: string,
  repo: string,
  prNumber: number
): Promise<PrFile[]> {
  const res = await fetch(
    `${API}/repos/${owner}/${repo}/pulls/${prNumber}/files?per_page=100`,
    { headers: ghHeaders() }
  )
  if (!res.ok) throw new Error(`GitHub files fetch failed: ${res.status}`)
  const files = (await res.json()) as PrFile[]
  return files.map(({ filename, status, patch }) => ({ filename, status, patch }))
}

/** Upsert the verdict comment via hidden marker (ADR-6: regenerate, never duplicate). */
export async function upsertPrComment(
  owner: string,
  repo: string,
  prNumber: number,
  body: string
): Promise<string> {
  const marked = `${MARKER}\n${body}`
  const listRes = await fetch(
    `${API}/repos/${owner}/${repo}/issues/${prNumber}/comments?per_page=100`,
    { headers: ghHeaders() }
  )
  if (!listRes.ok) throw new Error(`GitHub comment list failed: ${listRes.status}`)
  const comments = (await listRes.json()) as { id: number; body: string; html_url: string }[]
  const existing = comments.find((c) => c.body?.startsWith(MARKER))

  const res = existing
    ? await fetch(`${API}/repos/${owner}/${repo}/issues/comments/${existing.id}`, {
        method: "PATCH",
        headers: { ...ghHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ body: marked }),
      })
    : await fetch(`${API}/repos/${owner}/${repo}/issues/${prNumber}/comments`, {
        method: "POST",
        headers: { ...ghHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ body: marked }),
      })
  if (!res.ok) throw new Error(`GitHub comment write failed: ${res.status}`)
  const json = (await res.json()) as { html_url: string }
  return json.html_url
}

/** Stretch S3: surface the verdict as a commit status so BREAKING visibly blocks merge. */
export async function setCommitStatus(
  owner: string,
  repo: string,
  sha: string,
  state: "success" | "failure" | "pending" | "error",
  description: string
): Promise<void> {
  await fetch(`${API}/repos/${owner}/${repo}/statuses/${sha}`, {
    method: "POST",
    headers: { ...ghHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      state,
      description: description.slice(0, 140),
      context: "threxa/blast-radius",
    }),
  })
}
