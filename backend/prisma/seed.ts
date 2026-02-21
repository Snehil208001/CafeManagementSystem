import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("manager123", 10);

  const defaultLocation = await prisma.location.upsert({
    where: { id: "loc_default" },
    update: {},
    create: { id: "loc_default", name: "Main Branch", address: null },
  });

  const manager = await prisma.manager.upsert({
    where: { email: "manager@cafe.com" },
    update: {},
    create: {
      email: "manager@cafe.com",
      password: hashedPassword,
      name: "Cafe Manager",
    },
  });

  console.log("Created manager:", manager.email);

  // Create sample tables
  for (let i = 1; i <= 5; i++) {
    await prisma.cafeTable.upsert({
      where: { locationId_tableNumber: { locationId: defaultLocation.id, tableNumber: i } },
      update: {},
      create: {
        locationId: defaultLocation.id,
        tableNumber: i,
        qrCodeUrl: `/order?table=${i}&location=${defaultLocation.id}`,
      },
    });
  }
  console.log("Created 5 tables");

  // Create sample dishes
  const dishes = [
    { name: "Espresso", description: "Strong Italian coffee", price: 80, category: "Beverages" },
    { name: "Cappuccino", description: "Espresso with steamed milk", price: 120, category: "Beverages" },
    { name: "Latte", description: "Smooth espresso with milk", price: 130, category: "Beverages" },
    { name: "Cold Coffee", description: "Iced coffee with cream", price: 100, category: "Beverages" },
    { name: "Sandwich", description: "Grilled vegetable sandwich", price: 150, category: "Food" },
    { name: "Burger", description: "Classic veg burger", price: 180, category: "Food" },
    { name: "Pasta", description: "Creamy white sauce pasta", price: 200, category: "Food" },
    { name: "Brownie", description: "Chocolate brownie with ice cream", price: 140, category: "Desserts" },
    { name: "Muffin", description: "Blueberry muffin", price: 90, category: "Desserts" },
  ];

  for (const dish of dishes) {
    const existing = await prisma.dish.findFirst({
      where: { name: dish.name, locationId: defaultLocation.id },
    });
    if (!existing) {
      await prisma.dish.create({
        data: {
          locationId: defaultLocation.id,
          name: dish.name,
          description: dish.description,
          price: dish.price,
          category: dish.category,
        },
      });
    }
  }
  console.log("Created sample dishes");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
