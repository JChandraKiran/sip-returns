import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

function InvestmentDonutChart({ investedValue, currentValue }) {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !investedValue || !currentValue) return;

    // Initialize chart only once
    if (!chartInstanceRef.current) {
      chartInstanceRef.current = echarts.init(chartRef.current);
    }

    const myChart = chartInstanceRef.current;

    const profit = currentValue - investedValue;
    const isProfit = profit >= 0;
    const absProfit = Math.abs(profit);

    const option = {
      tooltip: {
        trigger: "item",
        formatter: function (params) {
          return `${params.marker} ${params.name}: $${parseFloat(
            params.value
          ).toFixed(2)} (${params.percent}%)`;
        },
      },
      legend: {
        top: "5%",
        left: "center",
      },
      series: [
        {
          name: "Investment Breakdown",
          type: "pie",
          radius: ["40%", "70%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: "#fff",
            borderWidth: 2,
          },
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: false,
            },
          },
          labelLine: {
            show: false,
          },
          data: [
            {
              value: investedValue,
              name: "Invested",
              itemStyle: { color: "#5470c6" },
            },
            {
              value: absProfit,
              name: isProfit ? "Profit" : "Loss",
              itemStyle: { color: isProfit ? "#91cc75" : "#ee6666" },
            },
          ],
        },
      ],
    };

    myChart.setOption(option, true);

    // Handle resize
    const handleResize = () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.resize();
      }
    };
    window.addEventListener("resize", handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
        chartInstanceRef.current = null;
      }
    };
  }, [investedValue, currentValue]);

  return (
    <div
      ref={chartRef}
      style={{
        width: "100%",
        height: "400px",
      }}
    />
  );
}

export default InvestmentDonutChart;
