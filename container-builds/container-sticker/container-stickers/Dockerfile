FROM golang:1.25.8
WORKDIR /app
COPY go.mod ./
COPY main.go ./
RUN go build -o sticker-app .
COPY static/ ./static/
RUN chgrp -R 0 /app && chmod -R g=u /app
USER 1001
EXPOSE 8080
ENV PORT=8080 DEFAULT_PROVIDER=gemini
CMD ["./sticker-app"]
