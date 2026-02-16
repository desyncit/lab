FROM docker.io/library/golang:1.24.4 as build
COPY ./server/main.go /build/server/
WORKDIR /build/
# -

RUN go mod init server \
 && go mod tidy \
 && go mod download \
 && go mod verify \
 && go build -C /build/server -o /go/bin/server ./main.go

# - 
FROM docker.io/library/golang:1.24.4
COPY --from=build /go/bin/server /usr/bin/server
COPY ./server/webroot /opt/webroot/
RUN useradd -s /sbin/nologin -r -m pxe
WORKDIR /opt/webroot
USER pxe
ENTRYPOINT [ "/usr/bin/server" ]
