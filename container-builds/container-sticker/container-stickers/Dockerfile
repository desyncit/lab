# ── Build stage ───────────────────────────────────────────────────────────────
FROM archlinux:latest AS builder

RUN pacman -Syu --noconfirm && \
    pacman -S --noconfirm go && \
    pacman -Scc --noconfirm

WORKDIR /build
COPY go.mod ./
COPY main.go ./

RUN go build -o sticker-app .

# ── Runtime stage ──────────────────────────────────────────────────────────────
FROM archlinux:latest

# No runtime deps needed — Go binary is statically linked
WORKDIR /app

COPY --from=builder /build/sticker-app ./
COPY static/ ./static/

# OKD: give root group ownership so arbitrary UIDs can run the app
RUN chgrp -R 0 /app && chmod -R g=u /app

USER 1001

EXPOSE 8080

ENV PORT=8080 \
    DEFAULT_PROVIDER=gemini

CMD ["./sticker-app"]
