import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const SellThroughChart = () => {
  const data = {
    labels: ["Sold", "Remaining"],
    datasets: [
      {
        label: "Sell-Through Rate",
        data: [75, 25],
        backgroundColor: ["#34d399", "#e5e7eb"], // green and gray
      },
    ],
  };

  const options = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.label}: ${context.raw}%`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <h2 className="text-lg font-semibold mb-2 text-center">Sell-Through Rate</h2>
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default SellThroughChart;
