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
      <el-form-item label="统计分组" prop="groupField">
        <el-select
          v-model="queryParams.groupField"
          placeholder="统计分组"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in groupFieldOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="图表类型" prop="chartType">
        <el-select
          v-model="queryParams.chartType"
          placeholder=""
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
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['health:body:bodyAbnormalRecord:stat']">统计</el-button>
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
  import {getAbnormalCategoryTree,getBodyAbnormalRecordStat} from "@/api/health/body/bodyAbnormalRecord";
  import CommonChart from '../../../chart/commonChart'
  
export default {
  name: "Stat",
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
      groupFieldOptions:[],
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
      //加载层配置
      loadingOptions: this.loadingOptions,
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: this.getYearDateRange(0),
      // 查询参数
      queryParams: {
        groupField:'DISEASE',
        chartType:'PIE'
      }
    };
  },
  created() {
    this.getEnumTree('BodyAbnormalRecordGroupType','FIELD',false).then(response => {
      this.groupFieldOptions = response;
    });
    this.initChart();
  },
  methods: {
    loadDiseaseOptions(){
      const dateGroupType = this.queryParams.dateGroupType;
      if(dateGroupType=='DAYCALENDAR'){
        getAbnormalCategoryTree('disease',false).then(response => {
          this.diseaseOptions = response;
        });
      }
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
    // 打开加载层
    openLoading() {
      this.loading = this.$loading(this.loadingOptions);
    },
    initChart() {
      this.openLoading();
      getBodyAbnormalRecordStat(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          //组装chart数据
          const chartType = this.queryParams.chartType;
          response.chartType=chartType;
          this.chartData = response;
          this.loading.close();
        }
      );
    }
  }
};
</script>
