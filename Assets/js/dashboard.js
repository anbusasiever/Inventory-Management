let products = [];

const saved = localStorage.getItem("products");
products = saved ? JSON.parse(saved) : [];

updateDashboard();

loadCategoryChart();

function updateDashboard() {
  const totalProducts = products.length;
  const today = new Date();

  const inStock = products
    .filter(p => p.stock > 0 && new Date(p.exp) >= today)
    .reduce((sum, p) => sum + p.stock, 0);

  const outOfStock = products.filter(p => {
    const isExpired = new Date(p.exp) < today;
    const isZeroStock = p.stock === 0;
    return isExpired || isZeroStock;
  }).length;

  const totalCategories = new Set(products.map(p => p.category)).size;

  document.getElementById("totalProducts").textContent = totalProducts;
  document.getElementById("inStock").textContent = inStock;
  document.getElementById("outOfStock").textContent = outOfStock;
  document.getElementById("totalCategories").textContent = totalCategories;
}

//Chart
function loadCategoryChart() {
  const products = JSON.parse(localStorage.getItem("products")) || [];

  // Count products by category
  const categoryCount = {};

  products.forEach(p => {
    if (!categoryCount[p.category]) {
      categoryCount[p.category] = 1;
    } else {
      categoryCount[p.category]++;
    }
  });

  const labels = Object.keys(categoryCount);
  const data = Object.values(categoryCount);

  // Random colors for each slice
  const colors = labels.map(() =>
    `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`
  );

  const ctx = document.getElementById("categoryPieChart").getContext("2d");

  new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: colors,
          borderColor: "#fff",
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "right",
          labels: {
            font: { size: 14 },
            padding: 20
          }
        }
      }
    }
  });
}

