package main
import (
    "log"
    "io"
    "net/http" 
    "github.com/gin-gonic/gin"
) 
	
func main() {
    r := gin.Default()

    const ipxeURL = "https://boot.ipxe.org/x86_64-efi/ipxe.efi" 

    r.GET("/", func(c *gin.Context) {
          c.File("./index.html")
    })

	r.GET("/ipxe.efi", func(c *gin.Context) {
		// 1. Fetch the file from the upstream source
		resp, err := http.Get(ipxeURL)
		if err != nil {
			log.Printf("Error fetching upstream: %v", err)
			c.String(http.StatusBadGateway, "Unable to fetch iPXE binary")
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			c.String(http.StatusBadGateway, "Upstream returned non-200 status")
			return
		}

		if length := resp.Header.Get("Content-Length"); length != "" {
			c.Header("Content-Length", length)
		}
		c.Header("Content-Type", "application/octet-stream")
		c.Header("Content-Disposition", "attachment; filename=ipxe.efi")

		_, err = io.Copy(c.Writer, resp.Body)
		if err != nil {
			log.Printf("Error streaming to client: %v", err)
		}
	})
    

    r.GET("/ping", func(c *gin.Context) {
 	  c.JSON(http.StatusOK, gin.H{
	      "message": "pong",
         })
    })
    if err := r.Run(":8080"); err != nil {
          log.Fatalf("Server failed to start: %v", err)
    }
}
