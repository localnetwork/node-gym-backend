const express = require("express");
const router = express.Router();
const {getTools, addTool, deleteTool, editTool} = require("../controllers/toolsController");



router.get('/tools', getTools)
router.post('/tools', addTool)
router.delete('/tools/:id', deleteTool)
router.put('/tools/:id', editTool)

module.exports = router