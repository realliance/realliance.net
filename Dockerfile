FROM docker.io/node:lts-alpine@sha256:fb6cb918cc72869bd625940f42a7d8ae035c4e786d08187b94e8b91c6a534dfd as builder

WORKDIR /work

# Removed for QuayIO build worker: --mount=type=cache,target=/usr/local/lib/node
RUN npm install -g \
    @node-minify/cli \
    @node-minify/cssnano \
    @node-minify/html-minifier

COPY . .

RUN node-minify --compressor cssnano --input 'index.css' --output 'index.css' && \
    node-minify --compressor html-minifier --input 'index.html' --output 'index.html'

FROM docker.io/nginx:stable-alpine@sha256:74694f2de64c44787a81f0554aa45b281e468c0c58b8665fafceda624d31e556

COPY --from=builder /work/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /work/favicon.ico /usr/share/nginx/html/
COPY --from=builder /work/index.* /usr/share/nginx/html/
