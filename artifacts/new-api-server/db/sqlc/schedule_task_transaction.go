package db

import (
	"context"

	"github.com/jackc/pgx/v5/pgtype"
)

type CreateScheduleTxParams struct {
	Schedule CreateScheduleParams
	Task     *CreateTaskParams
}

type CreateScheduleTxResult struct {
	Schedule Schedule
	Task     *Task
}

func (s *SQLStore) CreateScheduleTx(ctx context.Context, arg CreateScheduleTxParams) (CreateScheduleTxResult, error) {
	var result CreateScheduleTxResult

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
