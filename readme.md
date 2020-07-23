create a directed graph from links

# Inputs
## graph edges table
Table containing graph edges  ```[projectId].model.edges```

id	 STRING	NULLABLE	
metric	FLOAT	NULLABLE	
v1	STRING	NULLABLE	
v2	STRING	NULLABLE	
directional	BOOLEAN	NULLABLE	
seed	BOOLEAN	NULLABLE	

# start Vertices table
table containing start Verticies ```[projectId].model.startVertices```

# Outputs
## Results table
table for the result ```[projectId].model.ParentChild_versions```


```CREATE OR REPLACE TABLE `[projectId].model.ParentChild_versions`
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
)```


# Execution
```
curl http://localhost:3004/api/builder/initiate
```



[![Run on Google Cloud](https://deploy.cloud.run/button.svg)](https://deploy.cloud.run)
