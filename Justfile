default: build

build:
    deno run --allow-read --allow-write --allow-env build.ts

serve: build
    deno run --allow-net --allow-read https://deno.land/std@0.106.0/http/file_server.ts build

watch:
    watchexec -r -w src -w static -- just serve