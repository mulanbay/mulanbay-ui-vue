<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="选择乐器" prop="musicInstrumentIds">
        <el-select
          v-model="queryParams.musicInstrumentIds"
          placeholder="乐器"
          multiple
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
      <el-form-item label="X轴数据" prop="xgroupType">
        <el-select
          v-model="queryParams.xgroupType"
          placeholder="X轴数据"
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
      <el-form-item label="Y轴数据" prop="ygroupType">
        <el-select
          v-model="queryParams.ygroupType"
          placeholder="Y轴数据"
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
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['music:musicPractice:compareStat']">统计</el-button>
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
  import {getMusicPracticeCompareStat} from "@/api/music/musicPractice";
  import {deepClone} from "@/utils/index";
  import CommonChart from '../../chart/commonChart'

export default {
  name: "MusicPracticeCompareStat",
  components: {
    'common-chart':CommonChart
  },
  mounted() {
     //this.initChart();
  },
  data() {
    return {
      //图表数据
      chartData:{},
      //乐器列表
      musicInstrumentOptions:[],
      //统计分类
      dateGroupTypeOptions:[],
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: this.getYearDateRange(0),
      // 查询参数
      queryParams: {
        name: undefined,
        chartType: 'BAR',
        xgroupType:'DAYOFWEEK',
        ygroupType:'HOUR'
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
    this.getDictItemTree('CHART_DATE_GROUP_FULL',false).then(response => {
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
      //转换多选框的中挂号问题
      var qp = this.addDateRange(this.queryParams, this.dateRange);
      var acQueryParams = deepClone(qp);;
      acQueryParams.musicInstrumentIds = qp.musicInstrumentIds.join(',');
      getMusicPracticeCompareStat(acQueryParams).then(
        response => {
          //组装chart数据
          response.chartType='SCATTER';
          this.chartData = response;
        }
      );
    }
  }
};
</script>
