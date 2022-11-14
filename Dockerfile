FROM docker.io/denoland/deno as BUILDER

WORKDIR /work

COPY . .

RUN deno run --allow-read --allow-write --allow-env build.ts

FROM docker.io/nginx:stable-alpine

COPY --from=builder /work/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /work/build /usr/share/nginx/html/
