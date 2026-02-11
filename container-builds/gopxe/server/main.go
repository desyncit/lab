package main
import (
    "io"
    "os"
    "log"
    "strings"
    "net/http"
    "path/filepath"
    "github.com/gin-gonic/gin"
)
	
func main() {
    r := gin.Default()

    const ipxeURL = "https://boot.ipxe.org/x86_64-efi/ipxe.efi"
    const pxeBasePath = "/srv/"
  
    r.HEAD("/pxe/*filepath", func(c *gin.Context) {
       requestedPath := c.Param("filepath")
       cleanPath := filepath.Clean(requestedPath)
   
       if strings.Contains(cleanPath, "..") {
          c.String(http.StatusForbidden, "Access denied")
          return
       }

       fullPath := filepath.Join(pxeBasePath, cleanPath)
       fileInfo, err := os.Stat(fullPath)

       if err != nil {
          if os.IsNotExist(err) {
            c.String(http.StatusNotFound, "File not found")
          } else {
            c.String(http.StatusInternalServerError, "Error accessing file")
          }
          return
       }

       if fileInfo.IsDir() {
          c.String(http.StatusForbidden, "Cannot download directories")
          return
       }

       c.Status(http.StatusOK)
    })

    r.GET("/", func(c *gin.Context) {
          c.File("./index.html")
    })

    r.GET("/main.ipxe", func(c *gin.Context) {
          c.File("./main.ipxe")
    })

    r.GET("/ipxe.efi", func(c *gin.Context) {
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

     r.GET("/pxe/*filepath", func(c *gin.Context) {
        requestedPath := c.Param("filepath")
        cleanPath := filepath.Clean(requestedPath)
        
        if strings.Contains(cleanPath, "..") {
            c.String(http.StatusForbidden, "Access denied")
            return
        }
        
        fullPath := filepath.Join(pxeBasePath, cleanPath) 
        fileInfo, err := os.Stat(fullPath)

        if err != nil {
            if os.IsNotExist(err) {
                c.String(http.StatusNotFound, "File not found")
            } else {
                log.Printf("Error accessing file %s: %v", fullPath, err)
                c.String(http.StatusInternalServerError, "Error accessing file")
            }
            return
        }
        
        if fileInfo.IsDir() {
            c.String(http.StatusForbidden, "Cannot download directories")
            return
        }
        
        c.File(fullPath)
    })
    r.GET("/ping", func(c *gin.Context) { 
        c.JSON(http.StatusOK, 
               gin.H{ 
                    "message": "pong", 
               }) 
    })
    if err := r.Run(":8080"); err != nil {log.Fatalf("Server failed to start: %v", err)} 
}
