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
      <el-form-item label="跟踪曲子" prop="tuneType">
        <el-select
          v-model="queryParams.tuneType"
          placeholder="类型"
          clearable
          size="small"
          style="width: 80px"
          @change="getMusicPracticeTuneTreeselect"
        >
          <el-option
            v-for="dict in tuneTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
        <el-select
          v-model="queryParams.tune"
          style="width: 155px"
          filterable
          clearable
          allow-create
          size="small"
          default-first-option
        >
          <el-option
            v-for="dict in tuneOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="补全日期" prop="compliteDate">
        <el-switch v-model="queryParams.compliteDate"  @change="handleQuery"></el-switch>
      </el-form-item>
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['music:musicPractice:dateStat']">统计</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div>
      <common-chart :chartData="chartData"/>
    </div>

  </div>
</template>

<script>
  import {getMusicInstrumentTree} from "@/api/music/musicInstrument";
  import {getMusicPracticeDateStat} from "@/api/music/musicPractice";
  import {getMusicPracticeTuneTree} from "@/api/music/musicPraticeTune";
  import CommonChart from '../../chart/commonChart'


export default {
  name: "DateStat",
  components: {
    'common-chart':CommonChart
  },
  mounted() {
     this.initChart();
  },
  data() {
    return {
      //图表数据
      chartData:{},
      //乐器列表
      musicInstrumentOptions:[],
      //曲子类型
      tuneTypeOptions:[],
      tuneOptions:[],
      //统计分类
      dateGroupTypeOptions:[],
      //图表类型
      chartTypeOptions:[
        {
          id: 'BAR',
          text: '柱状图'
        },
        {
          id: 'LINE',
          text: '折线图'
        }
      ],
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: this.getYearDateRange(0),
      // 查询参数
      queryParams: {
        name: undefined,
        chartType: 'BAR',
        dateGroupType:'MONTH',
        compliteDate:true,
        tuneType:undefined
      }
    };
  },
  created() {
    //加载查询条件和表单的
    this.getMusicInstrumentTreeselect();
    //曲子类型
    this.getEnumTree('MusicPracticeTuneType','FIELD',false).then(response => {
      this.tuneTypeOptions = response;
    });
    this.getDictItemTree('CHART_DATE_GROUP',false).then(response => {
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
    /** 查询曲子下拉树结构 */
    getMusicPracticeTuneTreeselect() {
      var tuneType = this.queryParams.tuneType;
      getMusicPracticeTuneTree(tuneType).then(response => {
        this.tuneOptions = response;
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
      getMusicPracticeDateStat(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          //组装chart数据
          const dateGroupType = this.queryParams.dateGroupType;
          const chartType = this.queryParams.chartType;
          if(dateGroupType=='DAYCALENDAR'){
            response.chartType='CALANDER';
          }else if(chartType=='BAR'){
            response.chartType='BAR';
          }else{
            response.chartType='LINE';
          }
          this.chartData = response;
        }
      );
    }
  }
};
</script>
