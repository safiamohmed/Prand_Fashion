const dotenv = require("dotenv");
//مهم جدا جدا السطر ده يبقى فوق
dotenv.config();
const path = require("path");
const express = require("express");
const app = express();
//dot enviroment -> بحط البورتس والحاجات ديه ف فايل كونفجريشن وميبقاش اى حد يقدر يأكسس عليه
//هستدعى بقى البورت من ال .env
app.use(require("./middleware/cors.middleware"));
app.use(express.json());

//بيجبرنى انى افضل دايما فى الروت و اروح لصفحه البرودكتس يعنى محدش يقدر يعمل ../../ ويلعب ف الديركتوريز بتاعتى بسبب السطر ده
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const connectDB = require("./config/database.config");
connectDB();

//app.use("/purchase", require("./routes/order.route"));
app.use("/product", require("./routes/product.route"));
app.use("/cart",require('./routes/cart.route'));
app.use("/user", require("./routes/user.route"));
app.use("/order", require("./routes/order.route"));
app.use("/auth", require("./routes/auth.route"));
app.use("/report", require("./routes/report.route"));
app.use("/category", require("./routes/categories.route"));
app.use("/subCategory", require("./routes/subCategories.route"));
app.use("/testimonial", require("./routes/testimonial.route"));
const AppError = require("./utilites/app-error.utilies");
app.use("/", (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});
const errorMiddleware = require("./middleware/error-Handler.middleware");
app.use(errorMiddleware);
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`server started at port ${port}`);
});
