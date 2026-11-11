package db

import (
	"context"

	"github.com/jackc/pgx/v5/pgtype"
)

// Schedule Update maka Task juga ikut update

type CreateScheduleTxParams struct {
	Schedule CreateScheduleParams
	Task     *CreateTaskParams
}

type ScheduleTxResult struct {
	Schedule Schedule
	Task     *Task
}

type DeleteScheduleTxParams struct {
	Schedule DeleteScheduleParams
	Task     *DeleteTaskParams
}

type UpdateScheduleStatusTxParams struct {
	Schedule UpdateScheduleStatusParams
	Task     *UpdateTaskStatusParams
}

func (s *SQLStore) CreateScheduleTx(ctx context.Context, arg CreateScheduleTxParams) (ScheduleTxResult, error) {
	var result ScheduleTxResult

	err := s.execTx(ctx, func(q *Queries) error {
		params := arg.Schedule

		if arg.Task != nil {
			task, err := q.CreateTask(ctx, *arg.Task)
			if err != nil {
				return err
			}
			result.Task = &task
			params.TaskID = pgtype.Int8{Int64: task.ID, Valid: true}
		}

		schedule, err := q.CreateSchedule(ctx, params)
		if err != nil {
			return err
		}
		result.Schedule = schedule
		return nil
	})

	return result, err
}

func (s *SQLStore) DeleteScheduleTx(ctx context.Context, arg DeleteScheduleTxParams) error {
	err := s.execTx(ctx, func(q *Queries) error {
		params := arg.Schedule

		if arg.Task != nil {
			err := q.DeleteTask(ctx, *arg.Task)
			if err != nil {
				return err
			}
		}

		errSchedule := q.DeleteSchedule(ctx, params)
		if errSchedule != nil {
			return errSchedule
		}
		return nil
	})

	if err != nil {
		return err
	}

	return nil
}

func (s *SQLStore) UpdateScheduleStatusTx(ctx context.Context, arg UpdateScheduleStatusTxParams) (ScheduleTxResult, error) {
	var result ScheduleTxResult

	err := s.execTx(ctx, func(q *Queries) error {
		params := arg.Schedule

		if arg.Task != nil {
			task, err := q.UpdateTaskStatus(ctx, *arg.Task)
			if err != nil {
				return err
			}
			result.Task = &task
		}

		schedule, err := q.UpdateScheduleStatus(ctx, params)
		if err != nil {
			return err
		}
		result.Schedule = schedule
		return nil
	})

	return result, err
}

// Task Update maka Schedule juga ikut update

type TaskTxResult struct {
	Task     Task
	Schedule *Schedule
}

type CreateTaskTxParams struct {
	Task     CreateTaskParams
	Schedule *CreateScheduleParams
}

type UpdateTaskStatusTxParams struct {
	Task     UpdateTaskPositionParams
	Schedule *UpdateScheduleStatusParams
}

func (s *SQLStore) CreateTaskTx(ctx context.Context, arg CreateTaskTxParams) (TaskTxResult, error) {
	var result TaskTxResult

	err := s.execTx(ctx, func(q *Queries) error {
		params := arg.Task

		if arg.Schedule != nil {
			schedule, err := q.CreateSchedule(ctx, *arg.Schedule)
			if err != nil {
				return err
			}
			result.Schedule = &schedule
		}

		task, err := q.CreateTask(ctx, params)
		if err != nil {
			return err
		}
		result.Task = task
		return nil
	})

	return result, err
}

func (s *SQLStore) UpdateTaskStatusTx(ctx context.Context, arg UpdateTaskStatusTxParams) (TaskTxResult, error) {
	var result TaskTxResult

	err := s.execTx(ctx, func(q *Queries) error {
		params := arg.Task

		if arg.Schedule != nil {
			schedule, err := q.UpdateScheduleStatus(ctx, *arg.Schedule)
			if err != nil {
				return err
			}
			result.Schedule = &schedule
		}

		task, err := q.UpdateTaskPosition(ctx, params)
		if err != nil {
			return err
		}
		result.Task = task
		return nil
	})

	return result, err
}
