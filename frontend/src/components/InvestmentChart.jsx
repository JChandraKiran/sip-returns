import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

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
            color: "#5470c6",
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
            color: "#91cc75",
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
            color: "#fac858",
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
            color: "#ee6666",
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
        marginTop: "20px",
        borderRadius: "20px",
        border: "4px solid #F9812D",
        // boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
        // boxShadow:
        //   "rgba(179, 137, 22, 0.33) 0px 10px 36px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px",
      }}
    />
  );
}

export default InvestmentChart;
