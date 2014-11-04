so_cockpit
==========

StackOverflow Cockpit

This app collects un-answered values from my-tags. It adds them to a cassandra database and provides a simple web ui for users to mark posts internally as dastastax_closed.

In order to get this going you must have node.js (for cross-origin stuff). For this we use cors-anywhere module.

```
git clone https://github.com/phact/so_cockpit.git
node corsServer.js 
python -m SimpleHTTPServer
```
