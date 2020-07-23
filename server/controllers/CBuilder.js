const builderModel = require('../models/MBuilder');

exports.tree_initiate = async function(req, res) {
    let taskId = req.params.taskId;
    let projectId = req.params.projectId;

    res.send(await builderModel.buildTree(taskId, projectId));
};
