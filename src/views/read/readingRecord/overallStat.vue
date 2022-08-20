<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="阅读日期">
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
      <el-form-item label="统计分组" prop="valueType">
        <el-select
          v-model="queryParams.valueType"
          placeholder="统计分组"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in valueTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['read:readingRecord:overallStat']">统计</el-button>
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
  import {getReadingRecordOverallStat} from "@/api/read/readingRecord";
  import CommonChart from '../../chart/commonChart'

export default {
  name: "ReadingRecordOverallStat",
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
      //分组值类型
      valueTypeOptions:[
        {
          id: 'COUNT',
          text: '本数'
        },
        {
          id: 'MINUTES',
          text: '阅读时间'
        }
      ],
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: this.getYearDateRange(0),
      // 查询参数
      queryParams: {
        dateGroupType:'MONTH',
        valueType: 'COUNT'
      }
    };
  },
  created() {
    //加载查询条件和表单的
    this.getDictItemTree('CHART_OVERALL_GROUP',false).then(response => {
      this.dateGroupTypeOptions = response;
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
      getReadingRecordOverallStat(this.addDateRange(this.queryParams, this.dateRange)).then(
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
