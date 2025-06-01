const mysql = require('mysql2/promise');
const { faker } = require('@faker-js/faker');

// MySQL DB connection config
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'database e-commerce',
};

// Categories and their IDs
const categories = [
  { id: 7, name: 'Vehicles' },
  { id: 8, name: 'Property' },
  { id: 9, name: 'Electronics' },
  { id: 10, name: 'Home Furniture & Appliance' },
  { id: 11, name: 'Health & Beauty' },
  { id: 12, name: 'Clothes' },
];

const generateRandomProduct = (categoryId) => {
  return {
    Productname: faker.commerce.productName() + ' ' + faker.string.alpha(4),
    Quantity: faker.number.int({ min: 1, max: 100 }),
    Price: faker.number.float({ min: 10, max: 1000, precision: 0.01 }),
    Description: faker.commerce.productDescription(),
    Availability: faker.helpers.arrayElement(['In Stock', 'Out of Stock']),
    CategoryID: categoryId,
    img: faker.image.urlLoremFlickr({ category: 'product' }),
  };
};

const seedProducts = async () => {
  const connection = await mysql.createConnection(dbConfig);

  try {
    for (const category of categories) {
      const products = [];

      for (let i = 0; i < 50; i++) {
        const p = generateRandomProduct(category.id);
        products.push([
          p.Productname,
          p.Quantity,
          p.Price,
          p.Description,
          p.Availability,
          p.CategoryID,
          p.img,
        ]);
      }

      const insertQuery = `
        INSERT INTO product 
        (Productname, Quantity, Price, Description, Availability, CategoryID, img) 
        VALUES ?
      `;

      await connection.query(insertQuery, [products]);
      console.log(`Inserted 50 products for category: ${category.name}`);
    }

    console.log('✅ All products inserted successfully!');
  } catch (err) {
    console.error('❌ Error inserting products:', err);
  } finally {
    await connection.end();
  }
};

seedProducts();
