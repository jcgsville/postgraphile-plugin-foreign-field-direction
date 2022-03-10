const express = require("express");
const { postgraphile } = require("postgraphile");
const { ForeignFieldDirectionPlugin } = require('.')

const app = express();
app.use(
  postgraphile(
    "plugin_experimentation_db",
    "public",
    {
      watchPg: true,
      graphiql: true,
      enhanceGraphiql: true,
      appendPlugins: [ForeignFieldDirectionPlugin],
    }
  )
);

app.listen(3000);