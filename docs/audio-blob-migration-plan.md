# Audio storage migration plan

## Completed state

- The public Blob Store is `jinren-protocol-audio` (`hnd1`) and is linked to the Vercel project for production, preview, and development.
- Canonical chapter `audio.src` values use deterministic public Blob URLs without random filename suffixes.
- Local audio is used only as a validation and rollback stage. After Blob production validation succeeds, tracked files under `public/books/<slug>/audio/` are removed in a separate commit.
- `BLOB_READ_WRITE_TOKEN` is injected by Vercel and may be pulled into ignored `.env.local`; it must never be committed or printed.

## Safety model

The migration is split into five gates. A later gate must not begin until the previous gate passes.

1. **Inventory:** map every `books.json` audio reference to one non-empty local file, one Git path, one deterministic Blob pathname, its byte size, and SHA-256.
2. **Upload:** create/connect one Blob store, then upload without deleting or untracking local files. Use deterministic pathnames and retain the manifest.
3. **Verify:** require the Blob response to have the expected audio content type and exact byte length, then run the existing five-second remote seek at 120 seconds or the midpoint. Compare downloaded or streamed bytes when practical.
4. **Switch:** update `books.json` only after every file in the selected batch passes verification. Deploy and run Podcast UI plus full production audio validation.
5. **Retire:** only after production passes, remove the migrated working-tree audio files from Git in a separate reversible commit. Do not rewrite Git history without separate explicit approval.

If any gate fails, keep the existing production references. The dry-run manifest stores every original `audio.src` as `rollbackSrc`.

## Dry-run

Run the full deterministic inventory:

```powershell
npm run plan:audio-blob
```

The command writes `tmp/audio-blob-migration-plan.json`. The `tmp/` folder is ignored by Git because the manifest contains machine-generated deployment planning data. No upload, reference change, deletion, Git untracking, or history rewrite occurs.

For a fast diagnostic without hashing:

```powershell
node scripts/plan-audio-blob-migration.mjs --skip-hash
```

A no-hash result is not eligible for execution. The actual migration must use a manifest whose `status` is `passed`, whose `hashAlgorithm` is `sha256`, and whose invariants are all `true`.

## Provisioning note

The user approved creation of a public Blob Store and the associated storage/transfer usage before provisioning. Future stores or changes to access level still require a separate scope and cost review.

## Expected repository impact

Removing audio files in a later normal commit prevents future repository growth and makes new checkouts smaller after Git garbage collection or a fresh shallow clone. It does **not** remove the existing large objects from Git history. A history rewrite is a separate destructive operation that requires explicit approval and coordination with every clone.
