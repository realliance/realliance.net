FROM docker.io/node:lts-alpine@sha256:0e071f3c5c84cffa6b1035023e1956cf28d48f4b36e229cef328772da81ec0c5 as builder

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
COPY --from=builder /work/terminated.* /usr/share/nginx/html/
