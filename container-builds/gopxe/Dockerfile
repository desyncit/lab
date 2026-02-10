FROM docker.io/library/golang:1.24.4
COPY webroot /opt/webroot
WORKDIR /opt/webroot
RUN  go mod download && go mod verify
COPY . .
RUN go build -o server
EXPOSE 8080
CMD [ "./server" ]
