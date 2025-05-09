import { prisma } from '../lib/prisma';

async function createTestMenu() {
  console.log('Starting test menu creation...');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const menuText = `
# Today's Special Menu - ${today.toLocaleDateString('en-US', { 
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})}

# Starters
Tomato Soup - Rich and creamy with fresh basil - 5.50
Garden Salad - Mixed greens with balsamic dressing - 4.50
Bruschetta - Toasted bread with tomatoes and garlic - 6.00
Calamari - Crispy fried squid with aioli - 8.50

# Main Courses
Grilled Salmon - With roasted vegetables and lemon sauce - 18.90
Beef Steak - Premium cut with mushroom sauce - 22.50
Vegetable Pasta - Fresh pasta with seasonal vegetables - 14.50
Chicken Curry - Aromatic curry with basmati rice - 16.90
Risotto - Mushroom and truffle oil risotto - 17.50

# Desserts
Chocolate Cake - With vanilla ice cream - 6.50
Fresh Fruit Salad - Seasonal fruits with honey - 5.50
Tiramisu - Classic Italian dessert - 7.00
Crème Brûlée - French vanilla custard - 6.90

# Beverages
House Wine - Red or white, per glass - 5.00
Craft Beer - Local selection - 6.00
Soft Drinks - Various options - 2.50
`.trim();

  try {
    // Use transaction for data integrity
    await prisma.$transaction(async (tx) => {
      // Delete any existing menu for today (if exists)
      await tx.dailyMenu.deleteMany({
        where: { date: today }
      });

      // Create new menu
      const result = await tx.dailyMenu.create({
        data: {
          date: today,
          menuText
        }
      });

      console.log('✅ Test menu created successfully for:', result.date.toISOString().split('T')[0]);
      console.log('📝 Menu length:', menuText.length, 'characters');
      console.log('🕒 Last updated:', result.lastUpdated.toISOString());
    });

  } catch (error) {
    console.error('❌ Error creating test menu:');
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('📤 Database connection closed');
  }
}

// Execute the function
createTestMenu();