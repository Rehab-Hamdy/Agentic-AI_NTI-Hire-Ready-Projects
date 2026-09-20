const MENU = [
  {
    id: 1,
    name: 'Classic Burger',
    description: 'Juicy beef patty with melted cheddar, fresh lettuce, tomato, and our secret sauce on a toasted sesame bun.',
    price: 8,
    image: 'assets/images/classic-burger.png',
    available: true,
    category: 'mains'
  },
  {
    id: 2,
    name: 'Margherita Pizza',
    description: 'Traditional thin-crust pizza with San Marzano tomato sauce, fresh mozzarella, and fragrant basil leaves.',
    price: 12,
    image: 'assets/images/margherita-pizza.png',
    available: true,
    category: 'mains'
  },
  {
    id: 3,
    name: 'French Fries',
    description: 'Golden, crispy hand-cut fries seasoned with sea salt. Served with our house-made ketchup.',
    price: 4,
    image: 'assets/images/french-fries.png',
    available: true,
    category: 'sides'
  },
  {
    id: 4,
    name: 'Chicken Meal',
    description: 'Herb-marinated grilled chicken breast served with roasted seasonal vegetables and aromatic rice.',
    price: 10,
    image: 'assets/images/chicken-meal.png',
    available: true,
    category: 'mains'
  },
  {
    id: 5,
    name: 'Caesar Salad',
    description: 'Crisp romaine lettuce, shaved parmesan, golden croutons, and our creamy Caesar dressing.',
    price: 7,
    image: 'assets/images/caesar-salad.png',
    available: true,
    category: 'salads'
  },
  {
    id: 6,
    name: 'Pasta',
    description: 'Creamy fettuccine alfredo with a rich parmesan sauce, finished with fresh herbs and cracked pepper.',
    price: 9,
    image: 'assets/images/pasta.png',
    available: true,
    category: 'mains'
  }
];

export function getMenu() {
  return MENU;
}

export function getMenuItemById(id) {
  return MENU.find(item => item.id === id) || null;
}
