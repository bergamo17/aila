package db

import (
	"context"

	"github.com/jackc/pgx/v5/pgtype"
)

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
