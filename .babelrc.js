module.exports = function(api) {
  const isTest = api.env('test')

  return {
    presets: [
      ["@babel/env", {
        "targets": "> 0.5%, last 2 versions, not dead",
        "modules": isTest ? 'auto' : 'false'
      }]
    ],
    plugins: [
      ["@babel/plugin-transform-runtime"],
      ["@babel/plugin-proposal-class-properties", { "loose": true }]
    ]
  }
}