<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="看病日期">
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
          style="width: 120px"
        >
          <el-option
            v-for="dict in dateGroupTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="统计分类" prop="groupField">
        <el-select
          v-model="queryParams.groupField"
          placeholder="统计分类"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in groupFieldOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
        <el-select
          v-model="queryParams.groupType"
          placeholder="字段类型"
          clearable
          size="small"
          style="width: 100px"
        >
          <el-option
            v-for="dict in groupTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
        <el-select
          v-model="queryParams.feeField"
          v-if="queryParams.groupType=='TOTALPRICE'"
          placeholder="统计字段"
          clearable
          size="small"
          style="width: 150px"
        >
          <el-option
            v-for="dict in feeFieldOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['health:treat:treatRecord:overallStat']">统计</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div style="background-color: #183B64;">
      <common-chart :chartData="chartData"/>
    </div>

  </div>
</template>

<script>
  import {getTreatRecordOverallStat} from "@/api/health/treat/treatRecord";
  import CommonChart from '../../../chart/commonChart'

export default {
  name: "TreatRecordOverallStat",
  components: {
    'common-chart':CommonChart
  },
  mounted() {
     //this.initChart();
  },
  data() {
    return {
      //加载层配置
      loadingOptions: this.loadingOptions,
      //图表数据
      chartData:{},
      //统计分类
      dateGroupTypeOptions:[],
      //统计分类
      groupFieldOptions:[],
      groupTypeOptions:[],
      //费用类型
      feeFieldOptions:[],
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: this.getYearDateRange(0),
      // 查询参数
      queryParams: {
        dateGroupType:'MONTH',
        groupField:'diagnosed_disease',
        groupType:'COUNT',
        feeField:'total_fee'
      }
    };
  },
  created() {
    //加载查询条件和表单的
    this.getDictItemTree('CHART_OVERALL_GROUP',false).then(response => {
      this.dateGroupTypeOptions = response;
    });
    this.getDictItemTree('TREAT_ANALYSE_GROUP_FIELD',false).then(response => {
      this.groupFieldOptions = response;
    });
    this.getDictItemTree('TREAT_DATE_STAT_FIELD',false).then(response => {
      this.feeFieldOptions = response;
    });
    this.getDictItemTree('TREAT_ANALYSE_GROUP_TYPE',false).then(response => {
      this.groupTypeOptions = response;
    });
    this.initChart();
  },
  methods: {
    /** 搜索按钮操作 */
    handleQuery() {
      this.initChart();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.initChart();
    },
    // 打开加载层
    openLoading() {
      this.loading = this.$loading(this.loadingOptions);
    },
    initChart() {
      this.openLoading();
      getTreatRecordOverallStat(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          //组装chart数据
          const dateGroupType = this.queryParams.dateGroupType;
          response.chartType = 'HEAT_MAP';
          this.chartData = response;
          this.loading.close();
        }
      );
    }
  }
};
</script>
