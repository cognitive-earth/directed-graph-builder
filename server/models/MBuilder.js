"use strict";

//logging
const logger = require('debug')('builder:default');
logger.log = console.log.bind(console);

//own modules
const treeLib = require('../lib/buildTree');

//3rd Party modules
const nanoid = require('nanoid')

exports.buildTree = async function (taskId, projectId) {
    logger(`build Tree initiation requested`)
    if (treeLib.status.state === "ready") {

        taskId = taskId || nanoid();

        treeLib.links2Tree(taskId, projectId).catch(err => {
            logger(`could not create view content, ${JSON.stringify(err)}`)
            treeLib.status = {"state": "ready", "taskId": "unset"}
        });

        return {
            success: {"description": "view content triggered"},
            taskId: taskId
        }

    } else {

        return {
            error: {"description": "already running"},
            taskId: treeLib.status.taskId
        }

    }

}
