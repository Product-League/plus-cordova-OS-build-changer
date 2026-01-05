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

installDependencies(['minify@7.2.0', 'clean-css', 'imagemin@7.0.1', 'imagemin-pngquant@10.0.0', 'imagemin-svgo@11.0.1', 'imagemin-gifsicle@7.0.0', 'q', 'adm-zip@0.4.11']);
