const { findOrderById, getCurrentUser } = require("../lib/entity");

verifyOrderOwner = async(req, res, next) => {  
    const token = req.headers["authorization"];
    const bearerToken = token.split(" ")[1];

    if(bearerToken.length === 0 || bearerToken === "undefined") {
        return res.status(404).json({
            status_code: 404,
            error: "Order not found.",
        });
    } 

    const order = await findOrderById(req?.params?.id)
    const currentUser = getCurrentUser(bearerToken);
    if (order?.availed_by !== currentUser?.userId) {
        return res.status(404).json({
            status_code: 404,
            error: "Order not found.",
        });
    }
    next();
}

module.exports = {
    verifyOrderOwner
};