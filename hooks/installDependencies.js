const childProcess = require('child_process');

const installDependencies = (dependencies) =>{
  dependencies.forEach(name => {
    try {
      childProcess.execSync('npm install '+ name);
      console.log("Package " + name + " installed.")
    }catch (err){
      console.log("Failed to install "+ name);
    }
  });
}

installDependencies(['minify@7.2.0', 'clean-css', 'imagemin', 'imagemin-pngquant', 'imagemin-jpegtran', 'imagemin-svgo', 'imagemin-gifsicle']);