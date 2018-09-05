var fs = require('fs');
var Graph = require('graphlib').Graph
var dot = require("graphlib-dot");
var exec = require('child_process').exec;
var common = require('common-prefix')
console.log('Creating session maps...')

var infile = process.argv[2]
var outdir = process.argv[3]

try {
  if(!fs.statSync(infile).isFile() || !fs.statSync(outdir).isDirectory()) {
    console.log("Please provide an input file and an output directory!")
    process.exit(-1)
  }
} catch(e) {
  console.log("Please provide an input file and an output directory!")
  process.exit(-1)
}

createSessionMap(JSON.parse(fs.readFileSync(infile, 'utf8'))[0].results)

function createSessionMap(results) {
  var graphs = {}
  var names = {}
  results.forEach(function (item) {
    var appKey = item[3]

    if (typeof graphs[appKey] === 'undefined') {
      graphs[appKey] = new Graph({ multigraph: true })
    }

    var steps = item[5]
    lastNode = 'entry'
    steps.forEach(function (step, index) {
      var identifier = step[8]

      if (!graphs[appKey].hasEdge(lastNode, identifier)) {
        graphs[appKey].setEdge(lastNode, identifier)
      }

      lastNode = identifier
    })
  })
  Object.keys(graphs).forEach(function (appKey) {
    var graph = graphs[appKey]
    var output = dot.write(graph)
    fs.writeFileSync(outdir + '/' + appKey + '.dot', output);
  })
}
