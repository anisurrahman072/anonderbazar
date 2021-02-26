module.exports.autoreload = {
  active: true,
  usePolling: false,
  overrideMigrateSetting: false,
  dirs: [
    "api/models",
    "api/controllers",
    "api/services",
    "api/routes",
    "libs"
  ],
  ignored: [
    // Ignore all files with .ts extension
    "**.ts",
    "**.ejs"
  ]
};
