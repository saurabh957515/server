/** @format */

const mongoose = require("mongoose");
const TimerSchema = new mongoose.Schema({
  Timelog: {
    type: [
      {
        time: Number,
        logNote: String,
        isTimerOn: Boolean,
        logTime: String,
      },
    ],
    required: true,
  },
  isTimerOn: {
    type: Boolean,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  logNote: {
    type: String,
  },
});

module.exports = mongoose.model("logtime", TimerSchema);
