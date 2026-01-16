package ratelimit

import (
	"sync"
	"time"
)

type RateLimiter struct {
	mu       sync.Mutex
	tokens   int
	maxRate  int
	interval time.Duration
	lastTick time.Time
}

func NewRateLimiter(maxRate int, interval time.Duration) *RateLimiter {
	return &RateLimiter{
		tokens:   maxRate,
		maxRate:  maxRate,
		interval: interval,
		lastTick: time.Now(),
	}
}

func (r *RateLimiter) Allow() bool {
	r.mu.Lock()
	defer r.mu.Unlock()

	now := time.Now()
	elapsed := now.Sub(r.lastTick)
	r.tokens += int(elapsed / r.interval) * r.maxRate
	if r.tokens > r.maxRate {
		r.tokens = r.maxRate
	}
	r.lastTick = now

	if r.tokens > 0 {
		r.tokens--
		return true
	}
	return false
}
