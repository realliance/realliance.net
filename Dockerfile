FROM docker.io/node:lts-alpine as builder

WORKDIR /work

RUN --mount=type=cache,target=/usr/local/lib/node npm install -g \
    @node-minify/cli \
    @node-minify/cssnano \
    @node-minify/html-minifier

COPY . .

RUN node-minify --compressor cssnano --input 'index.css' --output 'index.css' && \
    node-minify --compressor html-minifier --input 'index.html' --output 'index.html'

FROM docker.io/nginxinc/nginx-unprivileged:alpine

COPY --from=builder /work/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /work/*.png /usr/share/nginx/html/
COPY --from=builder /work/index.* /usr/share/nginx/html/
