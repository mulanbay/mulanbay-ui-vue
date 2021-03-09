<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="人生经历" prop="lifeExperienceId">
        <el-select
          v-model="queryParams.lifeExperienceId"
          placeholder="人生经历"
          clearable
          size="small"
          style="width: 240px"
          @change="handleQuery"
        >
          <el-option
            v-for="dict in lifeExperienceOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="旅行日期">
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
      <el-form-item label="统计分组" prop="statType">
        <el-select
          v-model="queryParams.statType"
          placeholder="统计分组"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in statTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['life:lifeExperience:costStat']">统计</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

  <!--图表数据-->
  <div :id="id" :class="className" :style="{height:height,width:width,margin:0 }" />

  </div>

</template>

<script>
  import {getLifeExperienceTree,getLifeExperienceCostStat} from "@/api/life/lifeExperience";
  import {chartProps,createBarChart,createPieChart} from "@/utils/echarts";

  import * as echarts from 'echarts';
  import resize from '../../dashboard/mixins/resize.js'


export default {
  name: "LifeExperienceCostStat",
  mixins: [resize],
  props: {
    //父层带过来的账户信息值
    lifeExpData:{
      lifeExperienceId:undefined
    },
    className: {
      type: String,
      default: 'chart'
    },
    id: {
      type: String,
      //因为在经历首页有两个图表，所以id值不能一样
      default: 'chartCs'
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
      chart: null,
      lifeExperienceOptions:[],
      statTypeOptions:[],
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        lifeExperienceId:undefined,
        statType:'CONSUME_TYPE'
      }
    };
  },
  created() {
    this.getEnumTree('LifeExperienceCostStatType','FIELD',false).then(response => {
      this.statTypeOptions = response;
    });
    this.getLifeExperienceTreeselect();
    this.handleReceiveData(this.lifeExpData);
    //this.initChart();
  },
  //监听父层带过来的账户信息值
  watch:{
    lifeExpData(newVal,oldVal){
      this.handleReceiveData(newVal);
    }
  },
  methods: {
    /** 处理父类发起的数据 */
    handleReceiveData(data){
      this.queryParams.lifeExperienceId=data.lifeExperienceId+'';
      this.initChart();
    },
    /** 查询疾病标签下拉树结构 */
    getLifeExperienceTreeselect() {
      getLifeExperienceTree(false).then(response => {
        this.lifeExperienceOptions = response;
      });
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
      getLifeExperienceCostStat(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          //组装chart数据
          if(this.chart==null){
            this.chart = echarts.init(document.getElementById(this.id));
          }
          createPieChart(response,this.chart);
        }
      );
    }
  }
};
</script>
