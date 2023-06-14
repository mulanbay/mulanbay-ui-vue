<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="起止日期">
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
      <el-form-item label="匹配类型" prop="compareIdType">
        <el-select
          v-model="queryParams.compareIdType"
          placeholder="匹配类型"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in compareIdTypeOptions"
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
          size="small"
          style="width: 115px"
          @change="handleQuery"
        >
          <el-option
            v-for="dict in chartTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['log:buyRecordMatchLog:stat']">统计</el-button>
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
  import {statMatchLog} from "@/api/consume/buyRecordMatchLog";
  import {deepClone} from "@/utils/index";
  import CommonChart from '../../chart/commonChart'

export default {
  name: "BuyRecordMatchLogStat",
  components: {
    'common-chart':CommonChart
  },
  mounted() {
     //this.initChart();
  },
  data() {
    return {
      // 加载层信息
      loading: [],
      //加载层配置
      loadingOptions:this.loadingOptions,
      //图表数据
      chartData:{},
      //统计分类
      compareIdTypeOptions:[],
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
        chartType:'LINE'
      }
    };
  },
  created() {
    this.getDictItemTree('BUY_RECORD_MATCH_LOG_COMPARE_TYPE',false).then(response => {
      this.compareIdTypeOptions = response;
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
    initChart() {
      this.loading = this.$loading(this.loadingOptions);
      statMatchLog(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          //组装chart数据
          response.chartType=this.queryParams.chartType;
          this.chartData = response;
          this.chartData.smooth = true;
          this.loading.close();
        }
      );
    }
  }
};
</script>
