module.exports = function(api) {
  api.cache(true);
  
  return {
    presets: [
      ["@babel/env", {
        "targets": {}, // "> 0.5%, last 2 versions, not dead"
      }]
    ],
    plugins: [
      ["@babel/plugin-transform-runtime", { "corejs": false }]
    ]
  }
}