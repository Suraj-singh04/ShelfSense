import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const StockOvertimeChart = () => {
  const data = {
    labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"],
    datasets: [
      {
        label: "Unmoved Stock (units)",
        data: [100, 92, 90, 85, 80],
        borderColor: "#f87171", // red-400
        backgroundColor: "#fecaca", // red-200
        fill: false,
      },
    ],
  };

  const options = {
responsive: true,
plugins: {
tooltip: {
callbacks: {
label: function (context) {
return context.dataset.label + ": " + context.raw + " units";
},
},
},
title: {
display: true,
text: "Unmoved Stock Over Time (in Units)",
},
},
};

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <Line data={data} options={options} />
    </div>
  );
};

export default StockOvertimeChart;
