# n8n-nodes-onesend

An n8n community node for **onesend** - EU-sovereign transactional email delivery.

## Install (private, on your own n8n)

This is not yet published to npm. Install it as a local community node:

**Option A — from the packed tarball (recommended)**
1. Copy `n8n-nodes-onesend-0.1.0.tgz` to your n8n server.
2. In your n8n data directory (where `.n8n` lives), install it into the custom folder:
   ```
   cd ~/.n8n
   mkdir -p custom
   cd custom
   npm init -y            # only if no package.json here yet
   npm install /path/to/n8n-nodes-onesend-0.1.0.tgz
   ```
3. Restart n8n. The "onesend" node and "onesend API" credential type will appear.

**Option B — Docker n8n**
Mount/install the package into the `n8n_custom` extensions path, then restart the container.
See: https://docs.n8n.io/integrations/community-nodes/installation/

## Setup

1. Add an **onesend API** credential: API Key ID, API Secret, Base URL (`https://api.onesend.eu`).
   Use the "Test" button — it pings `/health` and should succeed.
2. Add the **onesend** node, choose **Send Email**, fill From / To / Subject / HTML / Text.

## Operation: Send Email

Calls `POST /v1/email/send`. Fields: from, to (comma-separated for multiple),
subject, html, text, and optional cc / bcc / reply_to. Returns the API response
(message_id + status per recipient).

## Notes

- The From domain must be verified on your onesend account.
- Auth is `Authorization: Bearer <keyId>:<secret>`, injected automatically by the credential.
