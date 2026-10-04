package util

import (
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
)

func ParseClock(s *string) (pgtype.Time, error) {
	if s == nil || *s == "" {
		return pgtype.Time{}, nil
	}
	t, err := time.Parse("15:04", *s)
	if err != nil {
		t, err = time.Parse("15:04:05", *s)
		if err != nil {
			return pgtype.Time{}, fmt.Errorf("Invalid time %q, use HH:MM or HH:MM:SS", *s)
		}
	}
	secs := t.Hour()*3600 + t.Minute()*60 + t.Second()
	return pgtype.Time{Microseconds: int64(secs) * 1_000_000, Valid: true}, nil
}

func FormatClock(t pgtype.Time) *string {
	if !t.Valid {
		return nil
	}
	d := time.Duration(t.Microseconds) * time.Microsecond
	s := fmt.Sprintf("%02d:%02d:%02d", int(d.Hours()), int(d.Minutes())%60, int(d.Seconds())%60)
	return &s
}
