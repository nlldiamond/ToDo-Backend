import express from "express";
import List from "../models/List.js";

const router = express.Router();

// -------------------- LIST ROUTES -------------------- //

// Get all lists with their tasks
router.get("/", async (req, res) => {
  try {
    const lists = await List.find();
    res.json(lists);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new list
router.post("/", async (req, res) => {
  try {
    const newList = new List({ name: req.body.name, tasks: [] });
    const savedList = await newList.save();
    res.status(201).json(savedList);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a list
router.delete("/:listId", async (req, res) => {
  try {
    await List.findByIdAndDelete(req.params.listId);
    res.json({ message: "List deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// -------------------- TASK ROUTES -------------------- //

// Add a new task to a list
router.post("/:listId/tasks", async (req, res) => {
  try {
    const list = await List.findById(req.params.listId);
    if (!list) return res.status(404).json({ message: "List not found" });

    const task = { text: req.body.text };
    list.tasks.push(task);
    await list.save();

    res.status(201).json(list.tasks[list.tasks.length - 1]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Toggle task complete
router.put("/:listId/tasks/:taskId", async (req, res) => {
  try {
    const list = await List.findById(req.params.listId);
    if (!list) return res.status(404).json({ message: "List not found" });

    const task = list.tasks.id(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.completed = !task.completed;
    await list.save();

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a task from a list
router.delete("/:listId/tasks/:taskId", async (req, res) => {
  try {
    const list = await List.findById(req.params.listId);
    if (!list) return res.status(404).json({ message: "List not found" });

    const task = list.tasks.id(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.deleteOne();
    await list.save();

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------- REORDER TASKS -------------------- //
router.put("/:listId/reorder", async (req, res) => {
  try {
    const { taskIds } = req.body; // 👈 frontend sends array of task IDs in new order

    const list = await List.findById(req.params.listId);
    if (!list) return res.status(404).json({ message: "List not found" });

    // Create a map for quick lookup
    const taskMap = {};
    list.tasks.forEach((task) => {
      taskMap[task._id] = task;
    });

    // Rebuild tasks array in the new order and update "order" field
    list.tasks = taskIds.map((id, index) => {
      const task = taskMap[id];
      if (task) {
        task.order = index; // update order field
        return task;
      }
    }).filter(Boolean); // filter out invalid IDs just in case

    await list.save();

    res.json(list.tasks);
  } catch (err) {
    console.error("❌ Reorder error:", err);
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/todos/:listId
router.put("/:listId", async (req, res) => {
  try {
    const { name } = req.body;
    const updatedList = await List.findByIdAndUpdate(
      req.params.listId,
      { name },
      { new: true }
    );
    res.json(updatedList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
