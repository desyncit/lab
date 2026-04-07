package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
)

// ── Config ────────────────────────────────────────────────────────────────────

type Config struct {
	Port            string
	AnthropicKey    string
	GeminiKey       string
	DefaultProvider string
}

func loadConfig() Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	provider := os.Getenv("DEFAULT_PROVIDER")
	if provider == "" {
		provider = "gemini"
	}
	return Config{
		Port:            port,
		AnthropicKey:    os.Getenv("ANTHROPIC_API_KEY"),
		GeminiKey:       os.Getenv("GEMINI_API_KEY"),
		DefaultProvider: provider,
	}
}

// ── Request / Response types ──────────────────────────────────────────────────

type GenerateRequest struct {
	Prompt   string `json:"prompt"`
	Provider string `json:"provider"`
	Model    string `json:"model"`
}

type GenerateResponse struct {
	ImageB64 string `json:"imageB64,omitempty"`
	MimeType string `json:"mimeType,omitempty"`
	Text     string `json:"text,omitempty"`
	Error    string `json:"error,omitempty"`
}

// ── Gemini native image generation (generateContent) ─────────────────────────
// Models: gemini-2.5-flash-image, gemini-3.1-flash-image-preview, gemini-3-pro-image-preview
// These use generateContent with responseModalities: ["IMAGE"]

type geminiContent struct {
	Parts []geminiPart `json:"parts"`
}

type geminiPart struct {
	Text       string            `json:"text,omitempty"`
	InlineData *geminiInlineData `json:"inlineData,omitempty"`
}

type geminiInlineData struct {
	MimeType string `json:"mimeType"`
	Data     string `json:"data"`
}

type geminiGenerateRequest struct {
	Contents           []geminiContent    `json:"contents"`
	GenerationConfig   geminiGenConfig    `json:"generationConfig"`
}

type geminiGenConfig struct {
	ResponseModalities []string `json:"responseModalities"`
}

type geminiGenerateResponse struct {
	Candidates []struct {
		Content struct {
			Parts []struct {
				Text       string `json:"text"`
				InlineData *struct {
					MimeType string `json:"mimeType"`
					Data     string `json:"data"`
				} `json:"inlineData"`
			} `json:"parts"`
		} `json:"content"`
	} `json:"candidates"`
	Error *struct {
		Message string `json:"message"`
		Code    int    `json:"code"`
	} `json:"error"`
}

func generateGemini(apiKey, model, prompt string) GenerateResponse {
	if model == "" {
		model = "gemini-2.5-flash-image"
	}

	stickerPrompt := prompt + ", sticker art style, bold black outline, white background, centered composition, vibrant colors, clean flat illustration, die-cut sticker design, no text"

	url := fmt.Sprintf(
		"https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
		model, apiKey,
	)

	reqBody := geminiGenerateRequest{
		Contents: []geminiContent{
			{Parts: []geminiPart{{Text: stickerPrompt}}},
		},
		GenerationConfig: geminiGenConfig{
			ResponseModalities: []string{"IMAGE"},
		},
	}

	b, _ := json.Marshal(reqBody)
	resp, err := http.Post(url, "application/json", bytes.NewReader(b))
	if err != nil {
		return GenerateResponse{Error: err.Error()}
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var gResp geminiGenerateResponse
	if err := json.Unmarshal(body, &gResp); err != nil {
		return GenerateResponse{Error: "failed to parse Gemini response: " + err.Error()}
	}
	if gResp.Error != nil {
		return GenerateResponse{Error: gResp.Error.Message}
	}

	// Extract image from response parts
	for _, candidate := range gResp.Candidates {
		for _, part := range candidate.Content.Parts {
			if part.InlineData != nil && part.InlineData.Data != "" {
				return GenerateResponse{
					ImageB64: part.InlineData.Data,
					MimeType: part.InlineData.MimeType,
				}
			}
		}
	}

	return GenerateResponse{Error: "no image returned from Gemini"}
}

// ── Anthropic ─────────────────────────────────────────────────────────────────

type anthropicRequest struct {
	Model     string             `json:"model"`
	MaxTokens int                `json:"max_tokens"`
	Messages  []anthropicMessage `json:"messages"`
}

type anthropicMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type anthropicResponse struct {
	Content []struct {
		Type string `json:"type"`
		Text string `json:"text"`
	} `json:"content"`
	Error *struct {
		Message string `json:"message"`
	} `json:"error"`
}

func generateAnthropic(apiKey, model, prompt string) GenerateResponse {
	if model == "" {
		model = "claude-sonnet-4-6"
	}

	stickerPrompt := fmt.Sprintf(
		`You are a sticker designer. The user wants a sticker of: "%s"

Describe in vivid detail what this sticker looks like visually — colors, shapes, style, mood.
Be specific and creative. 2-3 sentences max.`, prompt)

	reqBody := anthropicRequest{
		Model:     model,
		MaxTokens: 300,
		Messages:  []anthropicMessage{{Role: "user", Content: stickerPrompt}},
	}

	b, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", "https://api.anthropic.com/v1/messages", bytes.NewReader(b))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", apiKey)
	req.Header.Set("anthropic-version", "2023-06-01")

	resp, err := (&http.Client{}).Do(req)
	if err != nil {
		return GenerateResponse{Error: err.Error()}
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	var aResp anthropicResponse
	if err := json.Unmarshal(body, &aResp); err != nil {
		return GenerateResponse{Error: "failed to parse Anthropic response"}
	}
	if aResp.Error != nil {
		return GenerateResponse{Error: aResp.Error.Message}
	}

	var text strings.Builder
	for _, c := range aResp.Content {
		if c.Type == "text" {
			text.WriteString(c.Text)
		}
	}
	return GenerateResponse{Text: text.String()}
}

// ── Handlers ──────────────────────────────────────────────────────────────────

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func makeGenerateHandler(cfg Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			writeJSON(w, http.StatusMethodNotAllowed, GenerateResponse{Error: "method not allowed"})
			return
		}

		var req GenerateRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeJSON(w, http.StatusBadRequest, GenerateResponse{Error: "invalid request body"})
			return
		}
		if req.Prompt == "" {
			writeJSON(w, http.StatusBadRequest, GenerateResponse{Error: "prompt is required"})
			return
		}

		provider := req.Provider
		if provider == "" {
			provider = cfg.DefaultProvider
		}

		log.Printf("generate: provider=%s model=%s prompt=%q", provider, req.Model, req.Prompt)

		var result GenerateResponse
		switch provider {
		case "gemini":
			if cfg.GeminiKey == "" {
				writeJSON(w, http.StatusInternalServerError, GenerateResponse{Error: "GEMINI_API_KEY not configured"})
				return
			}
			result = generateGemini(cfg.GeminiKey, req.Model, req.Prompt)
		case "anthropic":
			if cfg.AnthropicKey == "" {
				writeJSON(w, http.StatusInternalServerError, GenerateResponse{Error: "ANTHROPIC_API_KEY not configured"})
				return
			}
			result = generateAnthropic(cfg.AnthropicKey, req.Model, req.Prompt)
		default:
			writeJSON(w, http.StatusBadRequest, GenerateResponse{Error: "unknown provider: " + provider})
			return
		}

		if result.Error != "" {
			writeJSON(w, http.StatusBadGateway, result)
			return
		}
		writeJSON(w, http.StatusOK, result)
	}
}

func makeConfigHandler(cfg Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		type modelInfo struct {
			ID    string `json:"id"`
			Label string `json:"label"`
		}
		type providerInfo struct {
			ID        string      `json:"id"`
			Label     string      `json:"label"`
			Available bool        `json:"available"`
			Models    []modelInfo `json:"models"`
		}

		providers := []providerInfo{
			{
				ID:        "gemini",
				Label:     "Google Gemini",
				Available: cfg.GeminiKey != "",
				Models: []modelInfo{
					{"gemini-2.5-flash-image", "Gemini 2.5 Flash Image (free tier ✓)"},
					{"gemini-3.1-flash-image-preview", "Gemini 3.1 Flash Image (billing required)"},
					{"gemini-3-pro-image-preview", "Gemini 3 Pro Image (billing required)"},
				},
			},
			{
				ID:        "anthropic",
				Label:     "Anthropic Claude",
				Available: cfg.AnthropicKey != "",
				Models: []modelInfo{
					{"claude-sonnet-4-6", "Claude Sonnet 4.6"},
					{"claude-opus-4-6", "Claude Opus 4.6"},
					{"claude-haiku-4-5-20251001", "Claude Haiku 4.5"},
				},
			},
		}

		writeJSON(w, http.StatusOK, map[string]any{
			"defaultProvider": cfg.DefaultProvider,
			"providers":       providers,
		})
	}
}

// ── Main ──────────────────────────────────────────────────────────────────────

func main() {
	cfg := loadConfig()

	mux := http.NewServeMux()
	mux.HandleFunc("/api/generate", makeGenerateHandler(cfg))
	mux.HandleFunc("/api/config", makeConfigHandler(cfg))
	mux.Handle("/", http.FileServer(http.Dir("./static")))

	addr := "0.0.0.0:" + cfg.Port
	log.Printf("Sticker app listening on %s (default provider: %s)", addr, cfg.DefaultProvider)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatal(err)
	}
}
