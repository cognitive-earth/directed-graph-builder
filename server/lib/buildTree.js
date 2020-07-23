//gcp modules
const {BigQuery} = require('@google-cloud/bigquery');
const {GoogleAuth} = require('google-auth-library');

let status = {"state": "ready", "taskId": "unset"}


module.exports = {links2Tree, status}


/*

CREATE OR REPLACE TABLE `[projectId].model.ParentChild_versions`
(
  createDate   STRING    OPTIONS(description="initiation time (version) of trace"),
  startVertex  STRING  OPTIONS(description="Id of first node of trace"),
  startType    STRING  OPTIONS(description="trace type feeder node or random seed"),
  trace        INT64   OPTIONS(description="processing order of the feederTrace"),
  depth        INT64   OPTIONS(description="depth of parent vertex"),
  child        INT64   OPTIONS(description="processing order of this child vertex"),
  sequence     INT64   OPTIONS(description="processing order of the vertices"),
  parentVertex STRING  OPTIONS(description="upstream vertex"),
  childVertex  STRING  OPTIONS(description="downstream vertex"),
  edgeId       STRING  OPTIONS(description="id of link between upstream and downstream vertex"),
  metric       FLOAT64 OPTIONS(description="cumulative value of id created")
)

*/

async function links2Tree(taskId, projectId, location) {
    status.state = "running"
    status.taskId = taskId

    console.log("initiated build of connectivity tree")

    let options = {}
    if (!projectId) {
        const auth = new GoogleAuth();
        projectId = await auth.getProjectId();
        options.projectId = projectId
    }

    options.location = location || 'australia-southeast1';

    let bigQuery = new BigQuery({projectId: projectId});
    let createDate = new Date()
    let createDateString = createDate.toUTCString()

    options.query = `SELECT * FROM \`${projectId}.model.edges\``

    let edges;

    try {
        [edges] = await bigQuery.query(options);
    } catch (error) {
        console.log(error)
        status.result = {"error": {"message": "failed executing build"}, taskId}
        console.log(status.result)

        //reset status
        status.state = "ready"
        status.taskId = "unset"
        return status.result
    }

    options.query = `SELECT * FROM \`${projectId}.model.startVertices\``

    let feederNodes;

    try {
        [feederNodes] = await bigQuery.query(options);
    } catch (error) {
        status.result = {"error": {"message": "failed executing build"}, "taskId": "links2Tree"}
        console.log(status.result)

        //reset status
        status.state = "ready"
        status.taskId = "unset"
        return status.result
    }

    console.log("completed fetching records")

    let edgeMap = new Map()         //all edges indexed by edge Id
    let seedEdgeSet = new Set()     //set of edges that are potential seed points for tracing
    let VertexEdgeIndex = new Map() //arrays of edge Id's indexed by vertex
    let nodeSet = new Set()         //set of all vertex
    let vertexMap = new Map()       //store of cumulative metric for vertex

    for (let i = 0; i < edges.length; i++) {
        let link = edges[i]

        edgeMap.set(link.id, link)
        if (link.seed) {
            seedEdgeSet.add(link.id)
        }

        if (VertexEdgeIndex.has(link.v1)) {
            VertexEdgeIndex.get(link.v1).push({"v": link.v2, "e": link.id})
        } else {
            VertexEdgeIndex.set(link.v1, [{"v": link.v2, "e": link.id}])
            nodeSet.add(link.v1)
        }

        //if link is not directional, allow it to be discovered when looking for nodes at v2
        if (!link.directional) {
            if (VertexEdgeIndex.has(link.v2)) {
                VertexEdgeIndex.get(link.v2).push({"v": link.v1, "e": link.id})
            } else {
                VertexEdgeIndex.set(link.v2, [{"v": link.v1, "e": link.id}])
                nodeSet.add(link.v2)
            }
        }
    }

    console.log("completed loading records into index")

    let traversedEdgeSet = new Set()
    let traversedSet = new Set()
    let activeFrontSet = new Set()
    let activeFrontIndex = []


    let getEdgeKeys = function (vertexId) {
        //using a given vertex, build an array of edge objects that have not yet been traversed
        let targetEdges = []
        nodeSet.delete(vertexId)

        //get all edges emanating from the current vertex
        let allEdges = VertexEdgeIndex.get(vertexId)

        //iterate through allEdges and select those not yet traversed
        for (let i = 0; i < allEdges.length; i++) {
            let connectedEdgeId = allEdges[i].e
            let connectedVertexId = allEdges[i].v

            if (!traversedEdgeSet.has(connectedEdgeId)) {
                //if the edge is not traversed
                targetEdges.push(allEdges[i])
                traversedEdgeSet.add(connectedEdgeId)
                seedEdgeSet.delete(connectedEdgeId)

                //if end vertex not traversed then add to the front (it may already be in the front)
                if (!traversedSet.has(connectedVertexId)) {
                    //if child not already in front then add to front and to a processing queue index
                    activeFrontSet.add(connectedVertexId)
                    activeFrontIndex.push(connectedVertexId)
                    traversedSet.add(connectedVertexId)
                }
            }
        }
        return targetEdges
    }


    let getNextId = function () {
        let startVertexId, type;
        if (feederNodes.length > 0) {
            let feederNode = feederNodes.shift()
            type = "feeder"
            startVertexId = feederNode.StartNode
        } else {
            type = "node"
            let startLinkId = seedEdgeSet.keys().next().value
            startVertexId = edgeMap.get(startLinkId).v1
        }
        return {type, startVertexId}
    }

    let nextVertex = getNextId()
    let n = 0
    let startVertexId = nextVertex.startVertexId
    let type = nextVertex.type

    while (startVertexId) {

        let rows = []

        console.log("startVertexId", startVertexId)

        activeFrontSet.add(startVertexId)
        activeFrontIndex.push(startVertexId)

        let j = 0

        do {
            let cumulativeMetric = 0;
            let currentVertexId = activeFrontIndex.shift()
            let newEdgeKeys = getEdgeKeys(currentVertexId)

            if (vertexMap.has(currentVertexId)) {
                cumulativeMetric = vertexMap.get(currentVertexId).m || 0
            }

            for (let k = 0; k < newEdgeKeys.length; k++) {

                let newEdgeId = newEdgeKeys[k].e
                let newVertexId = newEdgeKeys[k].v

                let edgeMetric = cumulativeMetric + edgeMap.get(newEdgeId).metric
                vertexMap.set(newVertexId, {"m": edgeMetric})

                rows.push({
                    "createDate": createDateString,
                    "startVertex": startVertexId,
                    "startType": type,
                    "trace": n,
                    "depth": j,
                    "child": k,
                    "sequence": k + j,
                    "parentVertex": currentVertexId,
                    "childVertex": newVertexId,
                    "edgeId": newEdgeId,
                    "metric": edgeMetric
                })

                //the edge between currentVertex and newVertex has been processed
                edgeMap.delete(newEdgeId)
            }

            //all edges emanating from currentVertex have now been processed
            activeFrontSet.delete(currentVertexId)

            if (rows.length > 9000) {
                //log the last row
                console.log(JSON.stringify(rows[rows.length - 1]))
                await insertRowsAsStream(rows, projectId).catch(err => console.log(err));
                rows = []
            }

            j++
        } while (activeFrontIndex.length > 0)

        if (rows.length > 0) {
            //log the last row
            console.log(JSON.stringify(rows[rows.length - 1]))
            await insertRowsAsStream(rows, projectId).catch(err => console.log(err));
            rows = []
        }

        n++
        nextVertex = getNextId()
        startVertexId = nextVertex.startVertexId
        type = nextVertex.type
        console.log("feedersProcessed", n, "nodesProcessed:", j)
    }

    console.log("completed Processing")
    console.log("edges remaining: ", edgeMap.size, seedEdgeSet.size)


    status.state = "ready"
    status.taskId = "unset"
}

async function insertRowsAsStream(rows, projectId) {
    let bigQuery = new BigQuery({projectId: projectId});

    try {
        await bigQuery
            .dataset("model")
            .table("ParentChild_versions")
            .insert(rows);
    } catch (error) {
        console.log(error)
    }
    //console.log(`Inserted ${rows.length} rows`);
}
