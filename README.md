so_cockpit
==========

StackOverflow Cockpit

This app collects un-answered values from my-tags. It adds them to a cassandra database and provides a simple web ui for users to mark posts internally as dastastax_closed.

Pull the repo
```
git clone https://github.com/phact/so_cockpit.git
```


First create your schema and stuff:
```
cqlsh setup.cql
```


In order to get the webapp going you must have node.js (for cross-origin stuff). For this we use cors-anywhere module.

```
git clone https://github.com/phact/so_cockpit.git
node corsServer.js 
python -m SimpleHTTPServer
```

hit the application at:
localhost:8000/index.html
