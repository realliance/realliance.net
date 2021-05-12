FROM docker.io/node:lts-alpine@sha256:d1a10d5865ab05430703f75e5a2a6897c1106a6f264d0317fbd785e24d4e8b25 as builder

WORKDIR /work

# Removed for QuayIO build worker: --mount=type=cache,target=/usr/local/lib/node
RUN npm install -g \
    @node-minify/cli \
    @node-minify/cssnano \
    @node-minify/html-minifier

COPY . .

RUN node-minify --compressor cssnano --input 'index.css' --output 'index.css' && \
    node-minify --compressor html-minifier --input 'index.html' --output 'index.html'

FROM docker.io/nginx:stable-alpine@sha256:eedbaccc242692c64b5996a363baaa9d9db65a8fc123483af13c640e5dee9b47

COPY --from=builder /work/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /work/favicon.ico /usr/share/nginx/html/
COPY --from=builder /work/index.* /usr/share/nginx/html/
