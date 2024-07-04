const { connection, query } = require("../config/db");
const getTools = async(req, res) => {
    try{ 
        const results = await query({
            sql: 'SELECT * FROM tools'
        })
        console.log(results)
        return res.status(200).json({
            message: "Hi",
            status_code:200,
            data: results
        })
    }
    catch (error) {
        return res.status(500).json({
            message: "Server Error",
            status_code:500
        })

    }
}

const addTool = async(req, res) => {
    const {name, purpose} = req.body
    console.log(name, purpose)
    const data = {name, purpose}
    if(!name){
        return res.status(422).json({
            message: "Name is required",
            status_code:422
        })
    }
    if(!purpose){
        return res.status(422).json({
            message: "Purpose is required",
            status_code:422
        })
    }
    try{
        const results = await query({
            sql: 'INSERT INTO tools (name, purpose) values (? , ?)',
            values: [name, purpose]
        })
        return res.status(200).json(data)
    }
    catch (error) {
        return res.status(500).json({
            message: "Server Error",
            status_code:500
        })

    }
}

const deleteTool = async(req, res) => {
    const {id} = req.params
    try{
        const results = await query({
            sql: 'DELETE FROM tools WHERE id = ?',
            values: [id]
        })
        if(results.affectedRows === 0){
            return res.status(404).json({
                message: "Tool not found",
            })
        }
        return res.status(200).json({
            message: "Tool deleted successfully",
            data: results[0]
        })    
    }
    catch (error) {
        return res.status(500).json({
            message: "Server Error",
            status_code:500
        })
    }
}

const editTool = async(req, res) => {
    const {id} = req.params
    const {name, purpose} = req.body
    if(!name){
        return res.status(422).json({
            message: "Name is required",
            status_code:422
        })
    }
    if(!purpose){
        return res.status(422).json({
            message: "Purpose is required",
            status_code:422
        })
    }
    const data = {
        name, purpose
    }
    try{
        const results = await query({
            sql: 'UPDATE tools SET name = ?, purpose = ? WHERE ID = ?',
            values: [name, purpose, id]
        })
        console.log(results)
        if(results.affectedRows === 0){
            return res.status(404).json({
                message: "Tool not found",
            })
        }
        return res.status(200).json({
            message: "Tool updated successfully",
            data: data
        })
    }
    catch (error) {
        return res.status(500).json({
            message: "Server Error",
            status_code:500
        })
    }
}

module.exports = {
    getTools,
    addTool,
    deleteTool,
    editTool,
}