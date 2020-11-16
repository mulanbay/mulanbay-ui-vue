<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="选择乐器" prop="musicInstrumentId">
        <el-select
          v-model="queryParams.musicInstrumentId"
          placeholder="乐器"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in musicInstrumentOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="练习日期">
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
      <el-form-item label="统计分类" prop="dateGroupType">
        <el-select
          v-model="queryParams.dateGroupType"
          placeholder="统计分类"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in dateGroupTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="图表类型" prop="chartType">
        <el-select
          v-model="queryParams.chartType"
          placeholder="图表类型"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in chartTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="排序方式" prop="chartOrderType">
        <el-select
          v-model="queryParams.chartOrderType"
          placeholder="排序方式"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in chartOrderTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['music:musicPractice:timeStat']">统计</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

  <!--图表数据-->
  <div :id="id" :class="className" :style="{height:height,width:width,margin:0 }" />

  </div>

</template>

<script>
  import {getMusicInstrumentTree} from "@/api/music/musicInstrument";
  import {getMusicPracticeTimeStat} from "@/api/music/musicPractice";
  import {chartProps,createPieChart,createBarChart,createLineChart} from "@/utils/echarts";
  import {getMusicPracticeTuneTree} from "@/api/music/musicPraticeTune";

  import echarts from 'echarts'
  import resize from '../../dashboard/mixins/resize.js'


export default {
  name: "TimeStat",
  mixins: [resize],
  props: chartProps,
  mounted() {
     this.initChart();
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
      //乐器列表
      musicInstrumentOptions:[],
      //曲子类型
      tuneTypeOptions:[],
      tuneOptions:[],
      //统计分类
      dateGroupTypeOptions:[],
      tuneTypeOptions:[],
      //图表类型
      chartTypeOptions:[
        {
          id: 'PIE',
          text: '饼图'
        },
        {
          id: 'BAR',
          text: '柱状图'
        }
      ],
      chartOrderTypeOptions:[
        {
          id: 'Y',
          text: 'Y轴数据'
        },
        {
          id: 'X',
          text: 'X轴数据'
        }
      ],
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: this.getYearDateRange(0),
      // 查询参数
      queryParams: {
        chartType: 'PIE',
        dateGroupType:'HOUR',
        chartOrderType:'Y'
      }
    };
  },
  created() {
    //加载查询条件和表单的
    this.getMusicInstrumentTreeselect();
    this.getDictItemTree('CHART_TIME_STAT_DATE_GROUP',false).then(response => {
      this.dateGroupTypeOptions = response;
    });
  },
  methods: {
    /** 查询乐器下拉树结构 */
    getMusicInstrumentTreeselect() {
      getMusicInstrumentTree(false).then(response => {
        this.musicInstrumentOptions = response;
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
      getMusicPracticeTimeStat(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          //组装chart数据
          this.chart = echarts.init(document.getElementById(this.id));
          const chartType = this.queryParams.chartType;
          if(chartType=='PIE'){
            createPieChart(response,this.chart);
          }else{
            createBarChart(response,this.chart);
          }
        }
      );
    }
  }
};
</script>
