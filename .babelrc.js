module.exports = function(api) {
  api.cache(true);
  
  return {
    presets: [
      ["@babel/env", {
        "loose": true,
        "targets": "> 0.5%, last 2 versions, not dead",
        "modules": false
      }]
    ],
    plugins: [
      ["@babel/plugin-transform-runtime"]
    ]
  }
}