<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class TaskController extends Controller
{

      // Create a new task
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'title' => 'required|string',
                'description' => 'required|string',
                'attachment' => 'required|file|mimes:jpg,jpeg,png',
                'time' => 'required|date',
                'status' => 'in:pending,in_progress,completed'
            ]);

            if ($validator->fails()) {
                Log::warning('Validation failed on task creation', [
                    'user_id' => Auth::id(),
                    'errors' => $validator->errors()
                ]);

                return response()->json([
                    'status' => 'fail',
                    'message' => 'Validation error',
                    'data' => null,
                    'error' => $validator->errors()
                ], 422);
            }

            $attachmentPath = null;
            if ($request->hasFile('attachment')) {
                $attachmentPath = $request->file('attachment')->store('attachments', 'public');
            }

            $task = Task::create([
                'title' => $request->title,
                'description' => $request->description,
                'attachment' => $attachmentPath,
                'time' => $request->time,
                'status' => $request->status ?? 'pending',
                'user_id' => Auth::id(),
            ]);

            Log::info('Task created', [
                'task_id' => $task->id,
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Task created successfully',
                'data' => $task,
                'error' => null
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating task', [
                'user_id' => Auth::id(),
                'exception' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create task',
                'data' => null,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Fetch all tasks logedin user
    public function index()
    {
        try {
            $tasks = Task::where('user_id', Auth::id())->get();

            Log::info('Tasks retrieved', ['user_id' => Auth::id()]);

            return response()->json([
                'status' => 'success',
                'message' => 'Tasks retrieved successfully',
                'data' => $tasks,
                'error' => null
            ]);
        } catch (\Exception $e) {
            Log::error('Error retrieving tasks', [
                'user_id' => Auth::id(),
                'exception' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve tasks',
                'data' => null,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // fetch a specific task
    public function show($id)
    {
        try {
            $task = Task::where('id', $id)->where('user_id', Auth::id())->first();

            if (!$task) {
                Log::warning('Task not found', ['task_id' => $id, 'user_id' => Auth::id()]);

                return response()->json([
                    'status' => 'fail',
                    'message' => 'Task not found',
                    'data' => null,
                    'error' => 'No task found with ID ' . $id
                ], 404);
            }

            Log::info('Task retrieved', ['task_id' => $task->id, 'user_id' => Auth::id()]);

            return response()->json([
                'status' => 'success',
                'message' => 'Task retrieved successfully',
                'data' => $task,
                'error' => null
            ]);
        } catch (\Exception $e) {
            Log::error('Error retrieving task', [
                'user_id' => Auth::id(),
                'task_id' => $id,
                'exception' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve task',
                'data' => null,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Update a task
    public function update(Request $request, $id)
    {
        try {
            $task = Task::where('id', $id)->where('user_id', Auth::id())->first();

            if (!$task) {
                Log::warning('Task not found for update', ['task_id' => $id, 'user_id' => Auth::id()]);

                return response()->json([
                    'status' => 'fail',
                    'message' => 'Task not found',
                    'data' => null,
                    'error' => 'No task found with ID ' . $id
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'title' => 'required|string',
                'description' => 'required|string',
                'attachment' => 'required|file|mimes:jpg,jpeg,png,pdf,docx',
                'time' => 'required|date',
                'status' => 'in:pending,in_progress,completed'
            ]);

            if ($validator->fails()) {
                Log::warning('Validation failed on task update', [
                    'task_id' => $id,
                    'user_id' => Auth::id(),
                    'errors' => $validator->errors()
                ]);

                return response()->json([
                    'status' => 'fail',
                    'message' => 'Validation error',
                    'data' => null,
                    'error' => $validator->errors()
                ], 422);
            }

            if ($request->hasFile('attachment')) {
                if ($task->attachment) {
                    Storage::disk('public')->delete($task->attachment);
                }
                $task->attachment = $request->file('attachment')->store('attachments', 'public');
            }

            $task->update($request->only(['title', 'description', 'time', 'status']));

            Log::info('Task updated', ['task_id' => $task->id, 'user_id' => Auth::id()]);

            return response()->json([
                'status' => 'success',
                'message' => 'Task updated successfully',
                'data' => $task,
                'error' => null
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating task', [
                'task_id' => $id,
                'user_id' => Auth::id(),
                'exception' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update task',
                'data' => null,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Delete a task
    public function destroy($id)
    {
        try {
            $task = Task::where('id', $id)->where('user_id', Auth::id())->first();

            if (!$task) {
                Log::warning('Task not found for deletion', ['task_id' => $id, 'user_id' => Auth::id()]);

                return response()->json([
                    'status' => 'fail',
                    'message' => 'Task not found',
                    'data' => null,
                    'error' => 'No task found with ID ' . $id
                ], 404);
            }

            if ($task->attachment) {
                Storage::disk('public')->delete($task->attachment);
            }

            $task->delete();

            Log::info('Task deleted', ['task_id' => $id, 'user_id' => Auth::id()]);

            return response()->json([
                'status' => 'success',
                'message' => 'Task deleted successfully',
                'data' => null,
                'error' => null
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting task', [
                'task_id' => $id,
                'user_id' => Auth::id(),
                'exception' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete task',
                'data' => null,
                'error' => $e->getMessage()
            ], 500);
        }
    }

public function completedTasksCount()
{
    try {
        $data = DB::table('tasks')
            ->join('users', 'tasks.user_id', '=', 'users.id')
            ->select('tasks.user_id', 'users.name', DB::raw('COUNT(*) as completed_tasks_count'))
            ->where('tasks.status', 'completed')
            ->groupBy('tasks.user_id', 'users.name')
            ->get();

        // Log the result
        Log::info('Fetched completed task counts by user.', ['data' => $data]);

        if ($data->isEmpty()) {
            Log::warning('No completed tasks found.');
            return response()->json([
                'status' => 'fail',
                'message' => 'No completed tasks found',
                'data' => null,
                'error' => 'No data for completed tasks'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Completed task count per user fetched successfully',
            'data' => $data
        ]);
    } catch (\Exception $e) {
        Log::error('Error fetching completed tasks by user.', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);

        return response()->json([
            'status' => 'fail',
            'message' => 'Failed to fetch completed task counts',
            'data' => null,
            'error' => $e->getMessage()
        ], 500);
    }
}


}
