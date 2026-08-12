const express = require("express");
const router = express.Router();

const db = require("../database");


// Check authentication
function requireLogin(req, res, next) {

    if (!req.session.user) {
        return res.status(401).json({
            message: "Please login first."
        });
    }

    next();
}


// GET ALL TASKS
router.get("/", requireLogin, (req, res) => {

    const sql = `
        SELECT *
        FROM tasks
        WHERE user_id = ?
        ORDER BY id DESC
    `;

    db.all(sql, [req.session.user.id], (err, tasks) => {

        if (err) {
            return res.status(500).json({
                message: "Unable to load tasks."
            });
        }

        res.json(tasks);
    });

});


// CREATE TASK
router.post("/", requireLogin, (req, res) => {

    const {
        title,
        description,
        priority,
        due_date
    } = req.body;

    if (!title) {
        return res.status(400).json({
            message: "Task title is required."
        });
    }

    const sql = `
        INSERT INTO tasks
        (user_id, title, description, priority, due_date, status)
        VALUES (?, ?, ?, ?, ?, 'Pending')
    `;

    db.run(
        sql,
        [
            req.session.user.id,
            title,
            description || "",
            priority || "Medium",
            due_date || ""
        ],
        function(err) {

            if (err) {
                return res.status(500).json({
                    message: "Unable to create task."
                });
            }

            res.json({
                message: "Task created successfully.",
                id: this.lastID
            });

        }
    );

});


// UPDATE TASK
router.put("/:id", requireLogin, (req, res) => {

    const {
        title,
        description,
        priority,
        due_date,
        status
    } = req.body;

    const sql = `
        UPDATE tasks
        SET
            title = ?,
            description = ?,
            priority = ?,
            due_date = ?,
            status = ?
        WHERE id = ? AND user_id = ?
    `;

    db.run(
        sql,
        [
            title,
            description || "",
            priority || "Medium",
            due_date || "",
            status || "Pending",
            req.params.id,
            req.session.user.id
        ],
        function(err) {

            if (err) {
                return res.status(500).json({
                    message: "Unable to update task."
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    message: "Task not found."
                });
            }

            res.json({
                message: "Task updated successfully."
            });

        }
    );

});


// DELETE TASK
router.delete("/:id", requireLogin, (req, res) => {

    const sql = `
        DELETE FROM tasks
        WHERE id = ? AND user_id = ?
    `;

    db.run(
        sql,
        [
            req.params.id,
            req.session.user.id
        ],
        function(err) {

            if (err) {
                return res.status(500).json({
                    message: "Unable to delete task."
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    message: "Task not found."
                });
            }

            res.json({
                message: "Task deleted successfully."
            });

        }
    );

});


module.exports = router;