# install bun
FROM oven/bun:latest as base
WORKDIR /app

# install deps with cache
COPY package.json package-lock.json ./
RUN bun install --frozen-lockfile --production

# copy code
COPY . .

# switch user
USER bun

# run app
CMD ["bun", "run", "discord/index.ts"]
