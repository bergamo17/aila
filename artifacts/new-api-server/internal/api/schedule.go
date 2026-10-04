package api

import (
	"errors"
	"net/http"
	"time"

	db "github.com/bergamo17/aila/db/sqlc"
	"github.com/bergamo17/aila/internal/token"
	"github.com/bergamo17/aila/internal/util"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type createScheduleRequest struct {
	SubjectId int64   `json:"subject_id" binding:"required,min=1"`
	TaskId    *int64  `json:"task_id" binding:"required,min=1"`
	Title     string  `json:"title" binding:"required"`
	EventDate string  `json:"event_date" binding:"required"`
	Reminder  bool    `json:"reminder"`
	Type      string  `json:"type" binding:"required"`
	StartTime *string `json:"start_time"`
	EndTime   *string `json:"end_time"`
}

type scheduleResponse struct {
	Id        int64   `json:"id"`
	SubjectId int64   `json:"subject_id"`
	TaskId    *int64  `json:"task_id"`
	Title     string  `json:"title"`
	EventDate string  `json:"event_date"`
	Reminder  bool    `json:"reminder"`
	Type      string  `json:"type"`
	StartTime *string `json:"start_time"`
	EndTime   *string `json:"end_time"`
}

type schedulerUri struct {
	Id int64 `uri:"id"`
}

type scheduleDateQuery struct {
	Date string `form:"date" binding:"required,datetime=2006-01-02"`
}

type scheduleDateRange struct {
	From string `form:"from" binding:"required,datetime=2006-01-02"`
	To   string `form:"to" binding:"omitempty,datetime=2006-01-02"`
}

const maxRangeDays = 92

func (server *Server) createSchedule(ctx *gin.Context) {
	var req createScheduleRequest

	err := ctx.ShouldBindJSON(&req)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errResponse(err))
		return
	}

	eventDate, err := time.Parse("2006-01-02", req.EventDate)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errResponse(errors.New("EVent date must be YYYY-MM-DD")))
		return
	}

	startTime, err := util.ParseClock(req.StartTime)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errResponse(err))
		return
	}

	endTime, err := util.ParseClock(req.EndTime)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errResponse(err))
		return
	}

	if startTime.Valid && endTime.Valid && endTime.Microseconds <= startTime.Microseconds {
		ctx.JSON(http.StatusBadRequest, errResponse(errors.New("End time must be greater or equal than start time")))
		return
	}

	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	user, err := server.store.GetUser(ctx, authPayload.Username)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	arg := db.CreateScheduleParams{
		UserID:    user.ID,
		SubjectID: req.SubjectId,
		TaskID:    pgtype.Int8{Int64: *req.TaskId, Valid: true},
		Title:     req.Title,
		EventDate: pgtype.Date{Time: eventDate, Valid: true},
		Reminder:  pgtype.Bool{Bool: req.Reminder, Valid: true},
		Type:      req.Type,
		StartTime: startTime,
		EndTime:   endTime,
	}

	schedule, err := server.store.CreateSchedule(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errResponse(errors.New("Cannot create schedule")))
		return
	}

	result := &scheduleResponse{
		Id:        schedule.ID,
		SubjectId: schedule.SubjectID,
		TaskId:    &schedule.TaskID.Int64,
		Title:     schedule.Title,
		EventDate: schedule.EventDate.Time.Format("2006-01-02"),
		Reminder:  schedule.Reminder.Bool,
		Type:      schedule.Type,
		StartTime: util.FormatClock(startTime),
		EndTime:   util.FormatClock(endTime),
	}

	ctx.JSON(http.StatusOK, result)
}

func (server *Server) getScheduleById(ctx *gin.Context) {
	var req schedulerUri

	err := ctx.ShouldBindUri(&req)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errResponse(err))
		return
	}

	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	user, err := server.store.GetUser(ctx, authPayload.Username)
	if err != nil {
		if err == pgx.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errResponse(errors.New("User is not found")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	args := db.GetScheduleByIdParams{
		ID:     req.Id,
		UserID: user.ID,
	}

	schedule, err := server.store.GetScheduleById(ctx, args)
	if err != nil {
		if err == pgx.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errResponse(errors.New("Scheduled event is not found")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	result := &scheduleResponse{
		Id:        schedule.ID,
		SubjectId: schedule.SubjectID,
		TaskId:    &schedule.TaskID.Int64,
		Title:     schedule.Title,
		EventDate: schedule.EventDate.Time.Format("2006-01-02"),
		Reminder:  schedule.Reminder.Bool,
		Type:      schedule.Type,
		StartTime: util.FormatClock(schedule.StartTime),
		EndTime:   util.FormatClock(schedule.EndTime),
	}

	ctx.JSON(http.StatusOK, result)
}

func (server *Server) deleteSchedule(ctx *gin.Context) {
	var req schedulerUri

	err := ctx.ShouldBindUri(&req)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errResponse(err))
		return
	}

	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	user, err := server.store.GetUser(ctx, authPayload.Username)
	if err != nil {
		if err == pgx.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errResponse(errors.New("User is not found")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	args := db.DeleteScheduleParams{
		ID:     req.Id,
		UserID: user.ID,
	}

	err = server.store.DeleteSchedule(ctx, args)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errResponse(errors.New("Failed to delete schedule")))
		return
	}

	ctx.JSON(http.StatusOK, nil)
}

func (server *Server) listScheduleByDate(ctx *gin.Context) {
	var req scheduleDateQuery

	err := ctx.ShouldBindQuery(&req)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errResponse(err))
		return
	}

	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	user, err := server.store.GetUser(ctx, authPayload.Username)
	if err != nil {
		if err == pgx.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errResponse(errors.New("User not found")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	date, err := util.ParseDate(&req.Date)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errResponse(err))
		return
	}

	args := db.ListScheduleByDateParams{
		UserID:    user.ID,
		EventDate: date,
	}

	list, err := server.store.ListScheduleByDate(ctx, args)
	if err != nil {
		if err == pgx.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errResponse(errors.New("No schedule yet")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	result := make([]scheduleResponse, 0, len(list))
	for _, s := range list {
		result = append(result, scheduleResponse{
			Id:        s.ID,
			SubjectId: s.SubjectID,
			TaskId:    &s.TaskID.Int64,
			Title:     s.Title,
			EventDate: s.EventDate.Time.Format("2006-01-02"),
			Reminder:  s.Reminder.Bool,
			Type:      s.Type,
			StartTime: util.FormatClock(s.StartTime),
			EndTime:   util.FormatClock(s.EndTime),
		})
	}

	ctx.JSON(http.StatusOK, result)
}

func (server *Server) listScheduleByUserAndDateRange(ctx *gin.Context) {
	var req scheduleDateRange

	err := ctx.ShouldBindQuery(&req)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errResponse(err))
		return
	}

	from, _ := time.Parse("2006-01-02", req.From)
	to, _ := time.Parse("2006-01-02", req.To)

	if to.Before(from) {
		ctx.JSON(http.StatusBadRequest, errResponse(errors.New("End date must be greater than start date")))
		return
	}

	if to.Sub(from) > maxRangeDays*24*time.Hour {
		ctx.JSON(http.StatusBadRequest, errResponse(errors.New("Maximum range date is 92 days")))
		return
	}

	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	user, err := server.store.GetUser(ctx, authPayload.Username)
	if err != nil {
		if err == pgx.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errResponse(errors.New("User not found")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	argsFrom, err := util.ParseDate(&req.From)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errResponse(errors.New("Start date must be on format YYYY-MM-DD")))
		return
	}

	argsTo, err := util.ParseDate(&req.To)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errResponse(errors.New("End date must be on format YYYY-MM-DD")))
		return
	}

	args := db.ListScheduleByUserAndDateRangeParams{
		UserID:      user.ID,
		EventDate:   argsFrom,
		EventDate_2: argsTo,
	}

	list, err := server.store.ListScheduleByUserAndDateRange(ctx, args)
	if err != nil {
		if err == pgx.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errResponse(errors.New("There is no scheduled event on the time range")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	result := make([]scheduleResponse, 0, len(list))
	for _, s := range list {
		result = append(result, scheduleResponse{
			Id:        s.ID,
			SubjectId: s.SubjectID,
			TaskId:    &s.TaskID.Int64,
			Title:     s.Title,
			EventDate: s.EventDate.Time.Format("2006-01-02"),
			Reminder:  s.Reminder.Bool,
			Type:      s.Type,
			StartTime: util.FormatClock(s.StartTime),
			EndTime:   util.FormatClock(s.EndTime),
		})
	}

	ctx.JSON(http.StatusOK, result)
}
