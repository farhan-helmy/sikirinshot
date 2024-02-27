package main

import (
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/render"
	"github.com/go-rod/rod"
	"github.com/lucsky/cuid"
)

type Sikirinshot struct {
	ID     string `json:"id"`
	WebUrl string `json:"web_url"`
}

type SikirinshotRequest struct {
	*Sikirinshot
}

func (a *SikirinshotRequest) Bind(r *http.Request) error {

	if a.Sikirinshot == nil {
		return errors.New("missing required Sikirinshot fields")
	}

	missingFields := []string{}

	if a.Sikirinshot.WebUrl == "" {
		missingFields = append(missingFields, "web_url")
	} else if !strings.HasPrefix(a.Sikirinshot.WebUrl, "https://") {
		return errors.New("web_url must start with https://")
	}

	if len(missingFields) > 0 {
		return errors.New("missing required Sikirinshot fields / field is empty: " + strings.Join(missingFields, ", "))
	}

	a.Sikirinshot.ID = cuid.New()

	return nil
}

type ErrResponse struct {
	Err            error `json:"-"` // low-level runtime error
	HTTPStatusCode int   `json:"-"` // http response status code

	StatusText string `json:"status"`          // user-level status message
	AppCode    int64  `json:"code,omitempty"`  // application-specific error code
	ErrorText  string `json:"error,omitempty"` // application-level error message, for debugging
}

func (e *ErrResponse) Render(w http.ResponseWriter, r *http.Request) error {
	render.Status(r, e.HTTPStatusCode)
	return nil
}

func ErrInvalidRequest(err error) render.Renderer {
	return &ErrResponse{
		Err:            err,
		HTTPStatusCode: 400,
		StatusText:     "Invalid request.",
		ErrorText:      err.Error(),
	}
}

func generateSikirinshot(s *Sikirinshot) {
	page := rod.New().MustConnect().MustPage(s.WebUrl)
	page.MustWaitStable().MustScreenshot(fmt.Sprintf("sikirinshot-%s.png", s.ID))
}

func main() {
	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("welcome"))
	})
	r.Post("/sikirinshot", func(w http.ResponseWriter, r *http.Request) {
		data := &SikirinshotRequest{}

		if err := render.Bind(r, data); err != nil {
			render.Render(w, r, ErrInvalidRequest(err))
			return
		}

		sikirinshot := data.Sikirinshot

		generateSikirinshot(sikirinshot)
	})
	http.ListenAndServe(":3000", r)
}
