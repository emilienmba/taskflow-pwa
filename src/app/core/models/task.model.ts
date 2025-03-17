/**
 * Represents a task in the TaskFlow application.
 */
export interface Task {
  id: number; // Unique identifier for the task
  title: string; // Title of the task
  description: string; // Description of the task
  completed: boolean; // Whether the task is completed
  dueDate?: Date; // Optional due date for the task
}