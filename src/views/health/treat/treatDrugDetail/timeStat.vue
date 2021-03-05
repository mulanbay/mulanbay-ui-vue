<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="用药日期">
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
      <el-form-item label="合并相同药名" prop="mergeSameName">
        <el-switch v-model="queryParams.mergeSameName"  @change="handleQuery"></el-switch>
        <span class="link-type" @click="msgAlert('提示','合并相同药名：多次看病记录有相同药品名称的药合并在一起统计。否则只统计该次看病记录中该药品的记录')"><i class="el-icon-question" /></span>
      </el-form-item>
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['health:treat:treatDrugDetail:timeStat']">统计</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

  <!--图表数据-->

  <div :id="id" :class="className" :style="{height:height,width:width,margin:0 }" />
  </div>

</template>

<script>
  import {getTreatDrugDetailTimeStat} from "@/api/health/treat/treatDrugDetail";
  import {chartProps,createScatterChart} from "@/utils/echarts";
  import * as echarts from 'echarts';
  import resize from '../../../dashboard/mixins/resize.js'

export default {
  name: "TimeStat",
  mixins: [resize],
  props: {
    //父层带过来的账户信息值
    treatDrugData: {
      treatDrugId: '',
    },
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
      default: (document.body.clientHeight - 400).toString() + 'px'
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
			//日期范围快速选择
			datePickerOptions:this.datePickerOptions,
			// 日期范围
			dateRange: this.getYearDateRange(0),
      // 查询参数
      queryParams: {
        mergeSameName:false
      }
    };
  },
  created() {
    this.handleReceiveData(this.treatDrugData);
  },
  //监听父层带过来的账户信息值
  watch:{
    treatDrugData(newVal,oldVal){
      this.handleReceiveData(newVal);
    }
  },
  methods: {
    /** 处理父类发起的数据 */
    handleReceiveData(data){
      this.queryParams.treatDrugId=data.treatDrugId;
      this.initChart();
    },
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
      getTreatDrugDetailTimeStat(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          //组装chart数据
          if(this.chart==null){
            this.chart = echarts.init(document.getElementById(this.id));
          }
          createScatterChart(response,this.chart);
          this.loading.close();
        }
      );
    }
  }
};
</script>
