package util

import (
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
)

func ParseDate(s *string) (pgtype.Date, error) {
	if s == nil || *s == "" {
		return pgtype.Date{}, nil
	}
	d, err := time.Parse("2006-01-02", *s)
	if err != nil {
		return pgtype.Date{}, fmt.Errorf("Invalid date %q, use YYYY-MM-DD: %w", *s, err)
	}
	return pgtype.Date{Time: d, Valid: true}, nil
}
