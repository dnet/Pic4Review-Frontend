# ── Stage 1: build ────────────────────────────────────────────────────────────
# Node 18 + legacy OpenSSL provider: webpack 2 uses MD4 hashing which is
# unavailable in OpenSSL 3 (Node 17+) without the legacy provider flag.
FROM node:18-alpine AS builder

ENV NODE_OPTIONS=--openssl-legacy-provider

WORKDIR /app

COPY package.json package-lock.json ./
# Native addons in the dep tree (e.g. libxmljs via pic4carto) need build tools
RUN apk add --no-cache python3 make g++ && npm ci

# Configurable values baked into the bundle at build time.
# P4R_URL: URL the browser uses to reach the backend.
# OAUTH_KEY: OSM OAuth2 client ID (register at https://www.openstreetmap.org/oauth2/applications/new
#            with redirect URI matching the frontend URL, e.g. http://localhost/)
ARG P4R_URL=http://localhost:28113
ARG OAUTH_KEY=WofjNAUxebyuS40aRy5nxXQot1GEMDVy85-MfuP_wxk

COPY . .

RUN sed -i "s|http://localhost:28113|${P4R_URL}|g" src/app/constants.js \
 && sed -i "s|WofjNAUxebyuS40aRy5nxXQot1GEMDVy85-MfuP_wxk|${OAUTH_KEY}|g" src/app/constants.js

# build:js runs webpack; skips the zip step which we don't need
RUN npm run build:js


# ── Stage 2: serve ────────────────────────────────────────────────────────────
FROM nginx:stable-alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
