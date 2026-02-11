FROM docker.io/library/golang:1.24.4 as build
COPY ./server/main.go /build/server/
WORKDIR /build/

RUN ls -R \
    && go mod init server \
    && go mod tidy \
    && ls -R \
    && go mod download \
    && go mod verify \
    && go build -C /build/server -o /go/bin/server ./main.go

FROM docker.io/library/golang:1.24.4
COPY --from=build /go/bin/server /usr/bin/server
COPY ./server/webroot /opt/webroot/
WORKDIR /opt/webroot
ENTRYPOINT [ "/usr/bin/server" ]
