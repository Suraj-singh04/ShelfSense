import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TopProductsChart = () => {
  const data = {
    labels: ["Horlicks", "Britannia", "Atta", "Amul Milk", "Dettol"],
    datasets: [
      {
        label: "Units Sold",
        data: [120, 95, 80, 60, 45],
        backgroundColor: "#60a5fa"
      }
    ]
  };

 const options = {
responsive: true,
plugins: {
tooltip: {
callbacks: {
label: function (context) {
return context.dataset.label + ": " + context.raw + " units sold";
},
},
},
legend: { position: "top" },
title: { display: true, text: "Top Performing Products (Units Sold)" },
},
};

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <Bar data={data} options={options} />
    </div>
  );
};

export default TopProductsChart;
