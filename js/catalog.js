/* Shared menu catalog. Prices are authoritative in the payment Worker. */
export const menu = [
  {
    id: "chai",
    title: "Chai",
    group: "beverages",
    illustration: "hero-chai.png",
    sizeLabels: ["M", "L"],
    items: [
      { name: "Adrak", prices: ["₹30", "₹45"] },
      { name: "Rose", prices: ["₹30", "₹45"] },
      { name: "Chocolate", prices: ["₹30", "₹45"] },
      { name: "Gurh", prices: ["₹30", "₹45"] },
      { name: "Elaichi", prices: ["₹35", "₹50"] },
      { name: "Adrak + Elaichi", prices: ["₹35", "₹50"] },
      { name: "Rajwadi", prices: ["₹35", "₹50"] },
      { name: "Butter", prices: ["₹50", "₹70"] }
    ]
  },
  {
    id: "hot-coffee",
    title: "Hot Coffee",
    group: "beverages",
    illustration: "hot-coffee.png",
    items: [
      { name: "Classic", price: "₹50" },
      { name: "Americano", price: "₹50" },
      { name: "Choco Mocha", price: "₹60" },
      { name: "Caramel Bliss", price: "₹100" },
      { name: "Hazelnut Delight", price: "₹100" },
      { name: "Vanilla Brew", price: "₹100" },
      { name: "Belgian Choco", price: "₹120" },
      { name: "Biscoff Rush", price: "₹120" },
      { name: "Arabica Brew", price: "₹120" }
    ]
  },
  {
    id: "cold-coffee",
    title: "Cold Coffee",
    group: "beverages",
    illustration: "cold-coffee.png",
    items: [
      { name: "Caramel Crown", price: "₹119" },
      { name: "Hazel Bliss", price: "₹119" },
      { name: "Vanilla Dream", price: "₹119" },
      { name: "Arabica Classic", price: "₹129" },
      { name: "Belgian Choco", price: "₹129" },
      { name: "Biscoff Royal", price: "₹149" }
    ]
  },
  {
    id: "shakes",
    title: "Shakes",
    group: "beverages",
    illustration: "shake.png",
    items: [
      { name: "Oreo", price: "₹119" },
      { name: "Black Forest", price: "₹119" },
      { name: "Vanilla", price: "₹119" },
      { name: "Strawberry", price: "₹139" },
      { name: "Kit Kat", price: "₹149" }
    ]
  },
  {
    id: "mojitos",
    title: "Coolers",
    group: "beverages",
    illustration: "mojito.png",
    items: [
      { name: "Nimbu Pani", price: "₹49" },
      { name: "Virgin Mojito", price: "₹99" },
      { name: "Jaljeera Lemonade", price: "₹99" },
      { name: "Masala Lemonade", price: "₹99" },
      { name: "Green Apple Mojito", price: "₹99" },
      { name: "Watermelon Mojito", price: "₹99" },
      { name: "Cranberry Mojito", price: "₹99" }
    ]
  },
  {
    id: "burgers",
    title: "Burgers",
    group: "food",
    illustration: "burger.png",
    items: [
      { name: "Aloo Tikki", price: "₹59" },
      { name: "Grill", price: "₹69" },
      { name: "Veg Burger", price: "₹79" },
      { name: "Cheese", price: "₹99" },
      { name: "Makhani", price: "₹119" },
      { name: "Achari", price: "₹119" },
      { name: "Monster King", price: "₹149" }
    ]
  },
  {
    id: "sandwiches",
    title: "Sandwich",
    group: "food",
    illustration: "sandwich.png",
    items: [
      { name: "Tandoori Masala", price: "₹109" },
      { name: "Special Makhani", price: "₹129" },
      { name: "Cheesy Melt", price: "₹139" },
      { name: "Chatpata Achari", price: "₹149" },
      { name: "Pizza-Style", price: "₹159" }
    ]
  },
  {
    id: "sub-sandwiches",
    title: "Sub Sandwich",
    group: "food",
    illustration: "sub-sandwich.png",
    items: [
      { name: "Creamy Makhani", price: "₹230" },
      { name: "Chatpata Achari", price: "₹230" },
      { name: "Smoky BBQ", price: "₹270" },
      { name: "Maharaja Jumbo", price: "₹300" }
    ]
  },
  {
    id: "pizza",
    title: "Pizza",
    group: "food",
    illustration: "pizza.png",
    sizeLabels: ["R", "M"],
    items: [
      { name: "Onion Crunch Pizza", prices: ["₹149", "₹229"] },
      { name: "Capsicum Delight", prices: ["₹149", "₹229"] },
      { name: "Tomato Twist", prices: ["₹149", "₹229"] },
      { name: "Golden Corn Delight", prices: ["₹149", "₹229"] },
      { name: "Cheesy Classic", prices: ["₹169", "₹249"] },
      { name: "Paneer Supreme", prices: ["₹169", "₹249"] },
      { name: "Monster King", prices: ["₹219", "₹299"] }
    ]
  },
  {
    id: "pasta",
    title: "Pasta",
    group: "food",
    illustration: "pasta.png",
    sizeLabels: ["H", "F"],
    items: [
      { name: "Red Sauce", prices: ["₹149", "₹219"] },
      { name: "White Sauce", prices: ["₹159", "₹229"] },
      { name: "Mix Sauce", prices: ["₹169", "₹239"] }
    ]
  },
  {
    id: "maggi",
    title: "Maggi",
    group: "food",
    illustration: "maggi.png",
    items: [
      { name: "Plain Maggi", price: "₹49" },
      { name: "Double Maggi", price: "₹89" },
      { name: "Veggies Maggi", price: "₹99" },
      { name: "Cheese Maggi", price: "₹119" }
    ]
  },
  {
    id: "garlic-bread",
    title: "Garlic Bread",
    group: "food",
    illustration: "garlic-bread.png",
    items: [
      { name: "Garlic Bread", price: "₹129" },
      { name: "Garlic Toast", price: "₹129" },
      { name: "Stuffed Garlic Bread", price: "₹149" },
      { name: "Paneer Garlic Bread", price: "₹169" }
    ]
  },
  {
    id: "fries",
    title: "Fries",
    group: "food",
    illustration: "fries.png",
    items: [
      { name: "Plain Fries", price: "₹99" },
      { name: "Tandoori Fries", price: "₹119" },
      { name: "Peri Peri Fries", price: "₹129" },
      { name: "Cheese Fries", price: "₹139" },
      { name: "Mint Fries", price: "₹149" }
    ]
  },
  {
    id: "others",
    title: "Others",
    group: "food",
    illustration: "hero-chai.png",
    items: [
      { name: "Maska Bun", price: "₹40" },
      { name: "Cake Rusk", price: "₹20" },
      { name: "Fan", price: "₹10" },
      { name: "Bisleri", price: "MRP" }
    ]
  },
  {
    id: "desserts",
    title: "Desserts",
    group: "food",
    illustration: "desserts.png",
    items: [
      { name: "Warm Chocolate Brownie", price: "₹79" },
      { name: "Chocolate Melt Sandwich", price: "₹119" },
      { name: "Milkybar White Chocolate Sandwich", price: "₹129" },
      { name: "Brownie Bliss with Ice Cream", price: "₹139" }
    ]
  }
];
