var fs = require('fs');
var path = require('path');

module.exports = function(robot, scripts) {
  var scriptsPath = path.resolve(__dirname, 'dist');
  if (fs.existsSync(scriptsPath)) {
    fs.readdirSync(scriptsPath).sort().forEach(script => {
      if (scripts && !('*' in scripts)) {
        if (script in scripts) {
          robot.loadFile(scriptsPath, script);
        }
      } else {
        robot.loadFile(scriptsPath, script)
      }
    });
  }
};
