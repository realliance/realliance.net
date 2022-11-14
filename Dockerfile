FROM docker.io/denoland/deno as BUILDER

WORKDIR /work

COPY . .

RUN deno run --allow-read --allow-write --allow-env build.ts

FROM docker.io/nginx:stable-alpine@sha256:74694f2de64c44787a81f0554aa45b281e468c0c58b8665fafceda624d31e556

COPY --from=builder /work/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /work/build /usr/share/nginx/html/
