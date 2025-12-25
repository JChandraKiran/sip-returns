import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { colors } from "../utils/colors";

function InvestmentChart({ chartData, cryptocurrency }) {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !chartData || chartData.length === 0) return;

    // Initialize chart only once
    if (!chartInstanceRef.current) {
      chartInstanceRef.current = echarts.init(chartRef.current);
    }

    const myChart = chartInstanceRef.current;

    // Prepare data
    const timestamps = chartData.map((item) =>
      new Date(item.timestamp).toLocaleDateString()
    );
    const prices = chartData.map((item) => parseFloat(item.price));
    const investedValues = chartData.map((item) =>
      parseFloat(item.investedValue)
    );
    const portfolioValues = chartData.map((item) =>
      parseFloat(item.portfolioValue)
    );
    const totalUnits = chartData.map((item) => parseFloat(item.totalUnits));

    const option = {
      title: {
        text: `${cryptocurrency.toUpperCase()} Investment`,
        left: "center",
        textStyle: {
          color: colors.textPrimary,
          fontSize: 20,
          fontWeight: "700",
        },
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
        },
        formatter: function (params) {
          let result = `<strong>${params[0].axisValue}</strong><br/>`;
          params.forEach((param) => {
            if (param.seriesName === "Units Accumulated") {
              result += `${param.marker} ${param.seriesName}: ${parseFloat(
                param.value
              ).toFixed(5)}<br/>`;
            } else {
              result += `${param.marker} ${param.seriesName}: $${parseFloat(
                param.value
              ).toFixed(2)}<br/>`;
            }
          });
          return result;
        },
      },
      legend: {
        data: [
          "Price",
          "Invested Value",
          "Portfolio Value",
          "Units Accumulated",
        ],
        top: 40,
        selected: {
          Price: false,
        },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "15%",
        containLabel: true,
      },
      dataZoom: [
        {
          type: "slider",
          show: true,
          xAxisIndex: [0],
          start: 0,
          end: 100,
        },
        {
          type: "inside",
          xAxisIndex: [0],
          start: 0,
          end: 100,
        },
      ],
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: timestamps,
        axisLabel: {
          rotate: 45,
        },
      },
      yAxis: [
        {
          type: "value",
          name: "Value ($)",
          position: "left",
          axisLabel: {
            formatter: "${value}",
          },
        },
        {
          type: "value",
          name: "Units",
          position: "right",
          axisLabel: {
            formatter: "{value}",
          },
        },
      ],
      series: [
        {
          name: "Price",
          type: "line",
          data: prices,
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 2,
          },
          itemStyle: {
            color: "#9c27b0",
          },
        },
        {
          name: "Invested Value",
          type: "line",
          data: investedValues,
          step: "end",
          showSymbol: false,
          lineStyle: {
            width: 2,
          },
          itemStyle: {
            color: colors.info,
          },
        },
        {
          name: "Portfolio Value",
          type: "line",
          data: portfolioValues,
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 3,
          },
          itemStyle: {
            color: colors.primary,
          },
        },
        {
          name: "Units Accumulated",
          type: "line",
          yAxisIndex: 1,
          data: totalUnits,
          step: "end",
          showSymbol: false,
          lineStyle: {
            width: 2,
          },
          itemStyle: {
            color: colors.success,
          },
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
  }, [chartData, cryptocurrency]);

  return (
    <div
      ref={chartRef}
      style={{
        width: "100%",
        height: "600px",
        borderRadius: "15px",
        border: `3px solid ${colors.primary}`,
        backgroundColor: colors.bgWhite,
        padding: "10px",
        boxSizing: "border-box",
      }}
    />
  );
}

export default InvestmentChart;
