const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const bookRoutes = require("./routes/bookRoutes");
const authorRoutes = require("./routes/authorRoutes");
const loanRoutes = require("./routes/loanRoutes");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/api/books", bookRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api/loans", loanRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`📚 Library API running on port ${PORT}`));