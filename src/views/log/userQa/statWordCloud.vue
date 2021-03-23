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
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['log:userQa:statWordCloud']">统计</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div :id="id" :class="className" :style="{height:height,width:width,margin:0 }" />

  </div>

</template>

<script>
  import {statUserQaWordCloud} from "@/api/log/userQa";
  import * as echarts from 'echarts';
  import resize from '../../dashboard/mixins/resize.js'
  import {chartProps,createWorldCloudChart} from "@/utils/echarts";
  import "echarts-wordcloud/dist/echarts-wordcloud";
  import "echarts-wordcloud/dist/echarts-wordcloud.min";

export default {
  name: "UserQaStatWordCloud",
  mixins: [resize],
  props: chartProps,
  data() {
    return {
      // 加载层信息
      loading: [],
      //加载层配置
      loadingOptions:this.loadingOptions,
      //图表数据
      chart: null,
      foodTypeOptions:[],
      dietTypeOptions:[],
      dietSourceOptions:[],
      //统计字段
      fieldOptions:[],
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: this.getYearDateRange(0),
      // 查询参数
      queryParams: {
        
      }
    };
  },
  created() {
    this.wordCloudStat();
  },
  methods: {
    // 打开加载层
    openLoading() {
      this.loading = this.$loading(this.loadingOptions);
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.wordCloudStat();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.wordCloudStat();
    },
    wordCloudStat() {
      this.openLoading();
      statUserQaWordCloud(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          //组装chart数据
          if (this.chart == null) {
            this.chart = echarts.init(document.getElementById(this.id));
          }
          createWorldCloudChart(response,this.chart);
          this.loading.close();
        }
      );
    }
  }
};
</script>
