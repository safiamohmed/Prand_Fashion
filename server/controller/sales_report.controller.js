const Purshase = require("../models/order.model");
const mongoose = require("mongoose");
exports.getSalesReport = async (req, res) => {
  //mydomin.com/api/report/salesReport?startAt=1/1/2025&endDate=1/1/2026
  //mydomain.com/starDate/endDate/category
  const { starDate, endDate } = req.query;
  const matchStage = {};
  if (starDate && endDate) {
    matchStage.purchaseAt = {};
    matchStage.purchaseAt.$gte = new Date(starDate);
    matchStage.purchaseAt.$lte = new Date(endDate);
    console.log(starDate, endDate);

    const summary = await Purshase.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $addFields: {
          totalPrice: { $multiply: ["$price", "$quantity"] },
        },
      },
      {
        $facet: {
          overallStats: [
            {
              $group: {
                _id: null,
                totalSalesAmount: {
                  $sum: "$totalPrice",
                },
                trotalQuntitySold: {
                  $sum: "$quantity",
                },
                totalPurshases: { $sum: 1 }, //هيجمع الدكمونت كلها
              },
            },
          ],
          topProducts: [
            {
              $group: {
                _id: "$product._id",
                name: { $first: "$product.name" },
                revenue: {
                  $sum: "$totalPrice", //مساهمة كل منتج في المبيعات
                },
                quantitySold: {
                  $sum: "$quantity",
                },
              },
            },
            {
              $sort: {
                revenue: -1,
              },
            },
            {
              $limit: 5,
            },
          ],
          topUsers: [
            {
              $group: {
                _id: "$user._id",
                name: {
                  $first: "$user.name",
                },
                email: {
                  $first: "$user.email",
                },
                totalSpent: {
                  $sum: "$totalPrice",
                },
                trotalQuntity: {
                  $sum: "$quantity",
                },
                totalPurshases: { $sum: 1 },
              },
            },
            {
              $sort: { totalSpent: -1 },
            },
            { $limit: 5 },
          ],
          monthlySales: [
            {
              $group: {
                _id: {
                  year: {
                    $year: "$PurshasedAt",
                  },
                  month: {
                    $month: "$PurshasedAt",
                  },
                },
                totalRevenue: {
                  $sum: "$totalPrice",
                },
                trotalQuntity: {
                  $sum: "$quantity",
                },
              },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
          ],
        },
      },
    ]);
    return res
      .status(200)
      .json({
        message: `sales report from ${starDate},to${endDate}`,
        date: summary,
      });
  }
  res.status(404).json({ message: "error,stadate or end date not found" });
};
