// Quatre requêtes MQL exécutées dans mongosh sur superstore.commandes
// Prérequis : dates converties avec 01_conversion_dates.js
// use superstore

// Requête 1 — Meubles vendus dans l'Ouest et le Centre avec au moins 30 % de remise :
// quelles lignes de commande perdent le plus ?
db.commandes.find(
  {
    Region: { $in: ["West", "Central"] },
    Category: "Furniture",
    Discount: { $gte: 0.3 },
    Profit: { $lt: 0 }
  },
  { _id: 0, "Order ID": 1, "Order Date": 1, State: 1, "Sub-Category": 1, Sales: 1, Discount: 1, Profit: 1 }
).sort({ Profit: 1 }).limit(10)


// Requête 2 — En 2017, combien de lignes ont une remise >= 50 % OU une perte de plus de 500 $ ?
db.commandes.countDocuments({
  "Order Date": { $gte: ISODate("2017-01-01"), $lt: ISODate("2018-01-01") },
  $or: [ { Discount: { $gte: 0.5 } }, { Profit: { $lt: -500 } } ]
})
// Total de l'année, pour calculer la proportion
db.commandes.countDocuments({ "Order Date": { $gte: ISODate("2017-01-01"), $lt: ISODate("2018-01-01") } })


// Requête 3 — Ventes, profit et marge par sous-catégorie (déficitaires en premier)
db.commandes.aggregate([
  { $group: { _id: "$Sub-Category", ventes: { $sum: "$Sales" }, profit: { $sum: "$Profit" }, nb: { $sum: 1 } } },
  { $project: { ventes: { $round: ["$ventes", 2] }, profit: { $round: ["$profit", 2] }, nb: 1,
      marge_pct: { $round: [{ $multiply: [{ $divide: ["$profit", "$ventes"] }, 100] }, 1] } } },
  { $sort: { profit: 1 } }
])


// Requête 4 — Ventes, nombre de lignes et remise moyenne par année
db.commandes.aggregate([
  { $group: { _id: { $year: "$Order Date" }, ventes: { $sum: "$Sales" }, commandes: { $sum: 1 }, remise_moy: { $avg: "$Discount" } } },
  { $project: { ventes: { $round: ["$ventes", 0] }, commandes: 1, remise_moy: { $round: ["$remise_moy", 3] } } },
  { $sort: { _id: 1 } }
])
