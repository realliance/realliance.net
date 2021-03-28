FROM docker.io/node:lts-alpine@sha256:8bd6100693a93cca2a3c3b1d8dfbcb7434d4b1731c625204966a87ea2efb36bc as builder

WORKDIR /work

# Removed for QuayIO build worker: --mount=type=cache,target=/usr/local/lib/node
RUN npm install -g \
    @node-minify/cli \
    @node-minify/cssnano \
    @node-minify/html-minifier

COPY . .

RUN node-minify --compressor cssnano --input 'index.css' --output 'index.css' && \
    node-minify --compressor html-minifier --input 'index.html' --output 'index.html'

FROM docker.io/nginx:stable-alpine@sha256:5aa813bef3232f2122c5ba042246d0f52baa6db95a05e8fa6f6c5ace3b410ebc

COPY --from=builder /work/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /work/favicon.ico /usr/share/nginx/html/
COPY --from=builder /work/index.* /usr/share/nginx/html/
