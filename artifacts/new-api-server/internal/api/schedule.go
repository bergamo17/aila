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

type scheduleRequest struct {
	SubjectId int64   `json:"subject_id" binding:"required,min=1"`
	TaskId    *int64  `json:"task_id" binding:"omitempty,min=1"`
	Title     string  `json:"title" binding:"required"`
	EventDate string  `json:"event_date" binding:"required"`
	Reminder  bool    `json:"reminder"`
	Type      string  `json:"type" binding:"required,oneof=task exam study_session reminder"`
	StartTime *string `json:"start_time"`
	EndTime   *string `json:"end_time"`
}

type scheduleResponse struct {
	Id          int64   `json:"id"`
	SubjectId   int64   `json:"subject_id"`
	TaskId      *int64  `json:"task_id"`
	Title       string  `json:"title"`
	EventDate   string  `json:"event_date"`
	Reminder    bool    `json:"reminder"`
	Type        string  `json:"type"`
	IsCompleted bool    `json:"is_completed"`
	StartTime   *string `json:"start_time"`
	EndTime     *string `json:"end_time"`
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

type scheduleStatus struct {
	IsCompleted *bool `json:"is_completed" binding:"required"`
}

const maxRangeDays = 92

func formatedScheduleResponse(s db.Schedule) scheduleResponse {
	var taskId *int64
	if s.TaskID.Valid {
		id := s.TaskID.Int64
		taskId = &id
	}

	return scheduleResponse{
		Id:          s.ID,
		SubjectId:   s.SubjectID,
		TaskId:      taskId,
		Title:       s.Title,
		EventDate:   s.EventDate.Time.Format("2006-01-02"),
		Reminder:    s.Reminder.Bool,
		Type:        s.Type,
		IsCompleted: s.IsCompleted,
		StartTime:   util.FormatClock(s.StartTime),
		EndTime:     util.FormatClock(s.EndTime),
	}
}

func (server *Server) createSchedule(ctx *gin.Context) {
	var req scheduleRequest

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

	subject, err := server.store.GetSubjectById(ctx, req.SubjectId)
	if err != nil {
		if err == pgx.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errResponse(errors.New("Subject not found")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	if user.ID != subject.UserID {
		ctx.JSON(http.StatusUnauthorized, errResponse(errors.New("You don't have the access to this subject")))
		return
	}

	var taskId pgtype.Int8

	if req.TaskId != nil {
		task, err := server.store.GetTask(ctx, db.GetTaskParams{
			ID:     *req.TaskId,
			UserID: user.ID,
		})

		if err != nil {
			if err == pgx.ErrNoRows {
				ctx.JSON(http.StatusNotFound, errResponse(errors.New("Task not found")))
				return
			}
			ctx.JSON(http.StatusInternalServerError, errResponse(err))
			return
		}

		if task.SubjectID != req.SubjectId {
			ctx.JSON(http.StatusBadRequest, errResponse(errors.New("Task does not belong to the selected subject")))
			return
		}

		taskId = pgtype.Int8{Int64: *req.TaskId, Valid: true}
	}

	arg := db.CreateScheduleParams{
		UserID:    user.ID,
		SubjectID: req.SubjectId,
		TaskID:    taskId,
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

	result := formatedScheduleResponse(schedule)

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

	result := formatedScheduleResponse(schedule)

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
		result = append(result, formatedScheduleResponse(s))
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
		result = append(result, formatedScheduleResponse(s))
	}

	ctx.JSON(http.StatusOK, result)
}

func (server *Server) listUpcomingSchedule(ctx *gin.Context) {
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

	args := db.ListUpcomingScheduleParams{
		UserID:    user.ID,
		EventDate: date,
	}

	upcomingSchedule, err := server.store.ListUpcomingSchedule(ctx, args)
	if err != nil {
		if err == pgx.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errResponse(errors.New("No upcoming scheduled event")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	result := make([]scheduleResponse, 0, len(upcomingSchedule))
	for _, u := range upcomingSchedule {
		result = append(result, formatedScheduleResponse(u))
	}

	ctx.JSON(http.StatusOK, result)
}

func (server *Server) updateSchedule(ctx *gin.Context) {
	var uri schedulerUri

	err := ctx.ShouldBindUri(&uri)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errResponse(err))
		return
	}

	var req scheduleRequest

	err = ctx.ShouldBindJSON(&req)
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

	date, err := util.ParseDate(&req.EventDate)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errResponse(err))
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

	subject, err := server.store.GetSubjectById(ctx, req.SubjectId)
	if err != nil {
		if err == pgx.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errResponse(errors.New("Subject not found")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	if user.ID != subject.UserID {
		ctx.JSON(http.StatusUnauthorized, errResponse(errors.New("You don't have the access to this subject")))
		return
	}

	var taskId pgtype.Int8

	if req.TaskId != nil {
		task, err := server.store.GetTask(ctx, db.GetTaskParams{
			ID:     *req.TaskId,
			UserID: user.ID,
		})

		if err != nil {
			if err == pgx.ErrNoRows {
				ctx.JSON(http.StatusNotFound, errResponse(errors.New("Task not found")))
				return
			}
			ctx.JSON(http.StatusInternalServerError, errResponse(err))
			return
		}

		if task.SubjectID != req.SubjectId {
			ctx.JSON(http.StatusBadRequest, errResponse(errors.New("Task does not belong to the selected subject")))
			return
		}

		taskId = pgtype.Int8{Int64: *req.TaskId, Valid: true}
	}

	args := db.UpdateScheduleParams{
		ID:        uri.Id,
		UserID:    user.ID,
		SubjectID: req.SubjectId,
		TaskID:    taskId,
		Title:     req.Title,
		EventDate: date,
		StartTime: startTime,
		EndTime:   endTime,
		Type:      req.Type,
		Reminder:  pgtype.Bool{Bool: req.Reminder, Valid: true},
	}

	updatedSchedule, err := server.store.UpdateSchedule(ctx, args)
	if err != nil {
		if err == pgx.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errResponse(errors.New("Schedule not found")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	result := formatedScheduleResponse(updatedSchedule)

	ctx.JSON(http.StatusOK, result)
}

func (server *Server) updateScheduleStatus(ctx *gin.Context) {
	var uri schedulerUri

	err := ctx.ShouldBindUri(&uri)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errResponse(err))
		return
	}

	var req scheduleStatus

	err = ctx.ShouldBindJSON(&req)
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

	args := db.UpdateScheduleStatusParams{
		ID:          uri.Id,
		UserID:      user.ID,
		IsCompleted: *req.IsCompleted,
	}

	updated, err := server.store.UpdateScheduleStatus(ctx, args)
	if err != nil {
		if err == pgx.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errResponse(errors.New("Schedule not found")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errResponse(err))
		return
	}

	result := formatedScheduleResponse(updated)

	ctx.JSON(http.StatusOK, result)
}
