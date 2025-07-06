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
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const HistoryGraph = () => {
  const data = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Total Sales",
        data: [120, 150, 170, 200],
        borderColor: "#60a5fa",
        backgroundColor: "#bfdbfe",
        fill: true
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Sales History Over Time"
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <Line data={data} options={options} />
    </div>
  );
};

export default HistoryGraph;
