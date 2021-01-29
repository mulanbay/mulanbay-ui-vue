<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="统计类型" prop="dateGroupType">
        <el-radio-group v-model="queryParams.dateGroupType">
          <el-radio label="YEAR">年</el-radio>
          <el-radio label="MONTH">月</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="queryParams.dateGroupType == 'YEAR'" label="选择年份">
        <el-date-picker
          v-model="queryParams.year"
          type="year"
          value-format="yyyy"
          style="width: 120px"
          placeholder="选择年">
        </el-date-picker>
      </el-form-item>
      <el-form-item v-if="queryParams.dateGroupType == 'MONTH'" label="选择月份">
        <el-date-picker
          v-model="queryParams.yearMonth"
          type="month"
          value-format="yyyy-MM"
          style="width: 120px"
          placeholder="选择月份">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="合并相同药名" prop="mergeSameName">
        <el-switch v-model="queryParams.mergeSameName"  @change="handleQuery"></el-switch>
        <span class="link-type" @click="msgAlert('提示','合并相同药名：多次看病记录有相同药品名称的药合并在一起统计。否则只统计该次看病记录中该药品的记录')"><i class="el-icon-question" /></span>
      </el-form-item>
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['health:treat:treatDrugDetail:calendarStat']">统计</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

  <!--图表数据-->

  <div :id="id" :class="className" :style="{height:height,width:width,margin:0 }" />
  </div>

</template>

<script>
  import {getTreatDrugDetailCalendarStat} from "@/api/health/treat/treatDrugDetail";
  import {chartProps,createCalanderPieChart,createCalanderChart} from "@/utils/echarts";
  import Treeselect from "@riophae/vue-treeselect";
  import "@riophae/vue-treeselect/dist/vue-treeselect.css";

  import * as echarts from 'echarts';
  import resize from '../../../dashboard/mixins/resize.js'

export default {
  name: "CalendarStat",
  mixins: [resize],
  props: {
    //父层带过来的账户信息值
    treatForDrugDetailCalendarStatData: {
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
      // 查询参数
      queryParams: {
        dateGroupType:'MONTH',
        yearMonth:(new Date()).Format("yyyy-MM"),
        mergeSameName:true
      }
    };
  },
  created() {
    this.handleReceiveData(this.treatForDrugDetailCalendarStatData);
  },
  //监听父层带过来的账户信息值
  watch:{
    treatForDrugDetailCalendarStatData(newVal,oldVal){
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
      const dateGroupType = this.queryParams.dateGroupType;
      if(dateGroupType=='MONTH'){
        let v = this.queryParams.yearMonth;
        this.queryParams.year = v.substring(0,4);
        this.queryParams.month = v.substring(5,7);
      }else{
        this.queryParams.month = undefined;
      }
      getTreatDrugDetailCalendarStat(this.queryParams).then(
        response => {
          //组装chart数据
          if(this.chart==null){
            this.chart = echarts.init(document.getElementById(this.id));
          }
          if(dateGroupType=='YEAR'){
            createCalanderChart(response,this.chart);
          }else{
            createCalanderPieChart(response,this.chart,echarts);
          }
          this.loading.close();
        }
      );
    }
  }
};
</script>
