<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="账户" prop="accountId">
        <el-select
          v-model="queryParams.accountId"
          placeholder="账户"
          clearable
          size="small"
          style="width: 240px"
          @change="handleAccountChange"
        >
          <el-option
            v-for="dict in accountOptions"
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
          :picker-options="datePickerOptions"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="数据" prop="snapshot">
        <el-select
          v-model="queryParams.snapshot"
          placeholder="方式"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in snapshotOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['fund:accountFlow:analyse']">统计</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

  <!--图表数据-->
  <div :id="id" :class="className" :style="{height:height,width:width,margin:0 }" />
  </div>

</template>

<script>
  import {getAccountTree} from "@/api/fund/account";
  import {getAccountFlowAnalyse} from "@/api/fund/accountFlow";
  import {chartProps,createChart} from "@/utils/echarts";
  import {getQueryObject} from "@/utils/index";
  import * as echarts from 'echarts';
  import resize from '../../dashboard/mixins/resize.js'

export default {
  name: "AccountFlowAnalyse",
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
      default: (document.body.clientHeight - 200).toString() + 'px'
    },
  },
  mounted() {
     //this.initChart();
  },
  beforeDestroy() {
    if (!this.chart) {
        return
    }
    this.chart.dispose()
    this.chart = null;
  },
  data() {
    return {
      // 加载层信息
      loading: [],
      //加载层配置
      loadingOptions:this.loadingOptions,
      chart: null,
      //账户列表
      accountOptions:[],
      //数据方式
      snapshotOptions:[
        {
          id: '',
          text: '显示全部'
        },
        {
          id: 'NOT_NULL',
          text: '只看快照'
        }
      ],
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: this.getYearDateRange(0),
      // 查询参数
      queryParams: {
        page:0,
        pageSize:10
      }
    };
  },
  created() {
    //查询账户树
    this.getAccountTreeselect();
    let qb = getQueryObject(null);
    this.queryParams.accountId=qb.id;
    this.initChart();
  },
  methods: {
    // 打开加载层
    openLoading() {
      this.loading = this.$loading(this.loadingOptions);
    },
    /** 查询搜索条件中的账户下拉树结构 */
    getAccountTreeselect() {
      getAccountTree(false).then(response => {
        this.accountOptions = response;
      });
    },
    /** 更新账户选择操作 */
    handleAccountChange() {
      //如果不调用强制更新，导致页面的下拉框显示不会更新，但是实际的值已经更新了
      this.$forceUpdate();
      this.handleQuery();
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
      getAccountFlowAnalyse(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          //组装chart数据
          if(this.chart==null){
            this.chart = echarts.init(document.getElementById(this.id));
          }
          let data = response;
          let option = {
            title: {
              text: data.title,
              subtext: data.subTitle
            },
            tooltip: {
              trigger: 'axis'
            },
            legend: {
              data: data.legendData
            },
            toolbox: {
              show: true,
              feature: {
                dataZoom: {
                  yAxisIndex: 'none'
                },
                dataView: {readOnly: false},
                magicType: {type: ['line', 'bar']},
                restore: {},
                saveAsImage: {}
              }
            },
            xAxis: {
              type: 'category',
              boundaryGap: false,
              data: data.xdata
            },
            yAxis: {
              type: 'value',
              axisLabel: {
                formatter: '{value} '+data.unit
              }
            },
            series: [
              {
                name: data.legendData[0],
                type: 'line',
                data: data.ydata[0].data,
                markPoint: {
                  data: [
                      {type: 'max', name: '最大值'},
                      {type: 'min', name: '最小值'}
                  ]
                }
              },
              {
                name: data.legendData[1],
                type: 'line',
                data: data.ydata[1].data,
                markPoint: {
                  data: [
                      {type: 'max', name: '最大值'},
                      {type: 'min', name: '最小值'}
                  ]
                },
                markLine: {
                  data: [
                      {type: 'average', name: '平均值'}
                  ]
                }
              }
            ]
          };
          createChart(option,this.chart);
          this.loading.close();
        }
      );
    }
  }
};
</script>
