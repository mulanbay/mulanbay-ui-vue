<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="预算周期" prop="period">
        <el-select
          v-model="queryParams.period"
          placeholder="预算周期"
          clearable
          size="small"
          style="width: 160px"
        >
          <el-option
            v-for="dict in periodOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="流水日期">
        <el-date-picker
          v-model="dateRange"
          size="small"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          unlink-panels
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="datePickerOptions">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['fund:budgetLog:valueErrorStat']">统计</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div :id="id" :class="className" :style="{height:height,width:width,margin:0 }" />
  </div>

  </div>
</template>

<script>
  import {getBudgetLogValueErrorStat} from "@/api/fund/budgetLog";
  import echarts from 'echarts'
  import {deepClone} from "@/utils/index";
  require('echarts/theme/macarons') // echarts theme
  import resize from '../../dashboard/mixins/resize.js'


  export default {
    name: "ValueErrorStat",
    mixins: [resize],
    props: {
      className: {
        type: String,
        default: 'chart'
      },
      id: {
        type: String,
        default: 'chart'
      },
      width: {
        type: String,
        default: '100%'
      },
      height: {
        type: String,
        default: (document.body.clientHeight - 160).toString() + 'px'
      },
      autoResize: {
        type: Boolean,
        default: true
      }
    },
    mounted() {
      //this.initChart();
    },
    data() {
      return {
        //图表数据
        chart: null,
        // 加载层信息
        loading: [],
        //加载层配置
        loadingOptions: this.loadingOptions,
        //预算列表
        budgetOptions: [],
        //周期
        periodOptions: [{
            id: 'MONTHLY',
            text: '月度预算'
          },
          {
            id: 'YEARLY',
            text: '年度预算'
          }
        ],
        //日期范围快速选择
        datePickerOptions: this.datePickerOptions,
        // 日期范围
        dateRange: this.getYearDateRange(0),
        // 查询参数
        queryParams: {
          period:undefined
        }
      };
    },
    created() {
      this.initChart();
    },
    methods: {
      // 打开加载层
      openLoading() {
        this.loading = this.$loading(this.loadingOptions);
      },
      /** 搜索按钮操作 */
      handleQuery() {
        this.initChart();
      },
      /** 重置按钮操作 */
      resetQuery() {
        this.resetForm("queryForm");
        this.initChart();
      },
      initChart() {
        this.openLoading();
        getBudgetLogValueErrorStat(this.addDateRange(this.queryParams, this.dateRange)).then(
          response => {
            //组装chart数据
            this.chart = echarts.init(document.getElementById(this.id));
            this.chart.resize();
            let chartData = response;
            const itemStyle = {
              normal: {
                label: {
                  show: true,
                  position: 'top',
                  formatter: '{c}'
                }
              }
            };
            const markPoint = {
              data: [{
                  type: 'max',
                  name: '最大值'
                },
                {
                  type: 'min',
                  name: '最小值'
                }
              ]
            };
            const markLine = {
              data: [{
                type: 'average',
                name: '平均值'
              }]
            };
            let option = {
              title: {
                text: chartData.title,
                subtext: chartData.subTitle
              },
              tooltip: {
                trigger: 'axis',
                axisPointer: {
                  type: 'cross',
                  crossStyle: {
                    color: '#999'
                  }
                }
              },
              label: {
                normal: {
                  show: true,
                  position: 'top'
                }
              },
              toolbox: {
                feature: {
                  dataView: {
                    show: true,
                    readOnly: false
                  },
                  magicType: {
                    show: true,
                    type: ['line', 'bar']
                  },
                  restore: {
                    show: true
                  },
                  saveAsImage: {
                    show: true
                  }
                }
              },
              legend: {
                data: chartData.legendData
              },
              xAxis: [{
                type: 'category',
                data: chartData.xdata,
                axisPointer: {
                  type: 'shadow'
                }
              }],
              yAxis: [{
                  type: 'value',
                  name: '误差值',
                  axisLabel: {
                    formatter: '{value} 元'
                  }
                },
                {
                  type: 'value',
                  name: '误差率',
                  axisLabel: {
                    formatter: '{value} %'
                  }
                }
              ],
              series: [
                {
                  name: chartData.ydata[0].name,
                  type: 'bar',
                  itemStyle:itemStyle,
                  markPoint:markPoint,
                  markLine:markLine,
                  data: chartData.ydata[0].data
                },
                {
                  name: chartData.ydata[1].name,
                  type: 'line',
                  itemStyle:itemStyle,
                  markPoint:markPoint,
                  markLine:markLine,
                  yAxisIndex: 1,
                  data: chartData.ydata[1].data
                }
              ]
            };
            this.chart.clear();
            this.chart.setOption(option, true);
            this.loading.close();
          }
        );
      }
    }
  };
</script>
