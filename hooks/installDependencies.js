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

installDependencies(['uglify-js@3.17.4', 'clean-css@5.3.2','imagemin@4.0.0', 'imagemin-svgo@9.0.0', 'imagemin-jpegtran@7.0.0', 'imagemin-gifsicle@7.0.0', 'imagemin-optipng@8.0.0', 'html-minifier@4.0.0'])