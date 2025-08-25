import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
    order: { type: Number, default: 0 }, // 👈 task ordering
  },
  { timestamps: true }
);

const listSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // list name
    tasks: [taskSchema], // array of tasks
  },
  { timestamps: true }
);

export default mongoose.model("List", listSchema);
