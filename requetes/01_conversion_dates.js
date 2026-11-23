// Conversion de "Order Date" et "Ship Date" (texte au format mois/jour/année) en type Date.
// À lancer dans mongosh après : use superstore
// Le filtre $type: "string" évite de reconvertir un document déjà traité si la commande est relancée.

db.commandes.updateMany(
  { "Order Date": { $type: "string" } },
  [ { $set: {
      "Order Date": { $let: { vars: { p: { $split: ["$Order Date", "/"] } },
        in: { $dateFromParts: {
          year:  { $toInt: { $arrayElemAt: ["$$p", 2] } },
          month: { $toInt: { $arrayElemAt: ["$$p", 0] } },
          day:   { $toInt: { $arrayElemAt: ["$$p", 1] } } } } } },
      "Ship Date": { $let: { vars: { p: { $split: ["$Ship Date", "/"] } },
        in: { $dateFromParts: {
          year:  { $toInt: { $arrayElemAt: ["$$p", 2] } },
          month: { $toInt: { $arrayElemAt: ["$$p", 0] } },
          day:   { $toInt: { $arrayElemAt: ["$$p", 1] } } } } } }
  } } ]
)

// Vérification
db.commandes.findOne({}, { "Order Date": 1, "Ship Date": 1 })
