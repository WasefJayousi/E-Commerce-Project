const items = [
    { ProductID: 1, Quantity: 2 },
    { ProductID: 3, Quantity: 1 },
    { ProductID: 5, Quantity: 4 }
  ];
  
  const values = items.map((item) =>`SELECT ${item.ProductID} AS ProductID, ${item.Quantity} AS Quantity`).join(" UNION ALL ");

console.log(values)